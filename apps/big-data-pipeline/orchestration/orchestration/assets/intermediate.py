import re
from typing import Callable
from urllib.parse import urlparse
# import time

from dagster import asset
from dagster_dbt import get_asset_key_for_model
from pyspark.sql.functions import udf, broadcast, size, explode
from pyspark.sql.types import ArrayType, StringType

from orchestration.assets.dbt import transformation_dbt_assets
from orchestration.utilities.spark import SparkManager


@asset(
    compute_kind="python",
    deps=[
        get_asset_key_for_model([transformation_dbt_assets], "staging_common_crawl"),
        get_asset_key_for_model([transformation_dbt_assets], "staging_country_codes"),
        get_asset_key_for_model([transformation_dbt_assets], "staging_web_technologies"),
    ],
)
def intermediate():
    """Combines multiple staging data."""
    web_technologies = SparkManager.spark.table("staging.staging_web_technologies").collect()

    get_tld_from_uri: Callable[[str], str] = lambda uri: (
        urlparse(uri).netloc.split('.')[-1]
    )
    get_tld_from_uri_udf = udf(get_tld_from_uri, StringType())

    get_web_technologies_for_html: Callable[[str], list[str]] = lambda html: [
        web_technology['name'] for web_technology in web_technologies
        if any(re.search(regular_expression, html) for regular_expression in web_technology['html_regular_expressions'])
    ]
    get_web_technologies_for_html_udf = udf(get_web_technologies_for_html, ArrayType(StringType()))

    dataframe_common_crawl = SparkManager.spark.table("staging.staging_common_crawl")
    print(dataframe_common_crawl.rdd.getNumPartitions())

    # Limit the dataset for increased development speed
    # dataframe_common_crawl = dataframe_common_crawl.limit(10)
    dataframe_common_crawl = dataframe_common_crawl.where(dataframe_common_crawl["response_payload_size"] < 1000)

    # Join website data with country code data, keeping only websites with a country code top level domain (ccTLD)
    print(dataframe_common_crawl.rdd.getNumPartitions())
    spark_dataframe = dataframe_common_crawl.select(
        dataframe_common_crawl["response_payload"],
        dataframe_common_crawl["response_target_uri"].alias("uri")
    )
    dataframe_country_codes = SparkManager.spark.table("staging.staging_country_codes")
    spark_dataframe = spark_dataframe.withColumn("top_level_domain", get_tld_from_uri_udf(spark_dataframe["uri"]))
    spark_dataframe = spark_dataframe.join(broadcast(dataframe_country_codes), on='top_level_domain', how='inner')
    spark_dataframe = spark_dataframe.drop('top_level_domain')

    # convert html column to web technology column
    spark_dataframe = spark_dataframe.withColumn("web_technologies", get_web_technologies_for_html_udf(spark_dataframe["response_payload"]))
    spark_dataframe = spark_dataframe.drop('response_payload')

    # add web technology count column
    spark_dataframe = spark_dataframe.withColumn("web_technology_count", size("web_technologies"))
    # split the web technology arrays to multiple lines
    spark_dataframe = spark_dataframe.withColumn('web_technology', explode('web_technologies'))

    print(spark_dataframe.rdd.getNumPartitions())
    spark_dataframe.repartition()
    spark_dataframe.writeTo("intermediate.intermediate").partitionedBy("country_code").createOrReplace()
    # spark_dataframe.writeTo("intermediate.unpartitioned").createOrReplace()

    # time.sleep(300)
