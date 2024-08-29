from dagster import asset

from orchestration.utilities.country_codes import fetch_tables, table_to_dataframe, write_source
from orchestration.utilities.spark import convert_pandas_to_spark_dataframe


@asset(compute_kind="python")
def source_country_codes():
    """Retrieves a table from Wikipedia, transforming it so that each top-level domain is assigned an ISO 3166 country
    code.
    """
    tables = fetch_tables()
    dataframe = table_to_dataframe(tables[0])
    spark_dataframe = convert_pandas_to_spark_dataframe(dataframe)
    write_source(spark_dataframe)

    # print(spark.sparkContext.master)

    # # if spark.sparkContext.master == 'local[*]':
    # #     spark.conf.set("spark.sql.catalog.demo.s3.endpoint", "http://minio:9000")
    # # else:
    # #     spark.conf.set("spark.sql.catalog.demo.s3.endpoint", "http://minio:9000")

    # for key, value in spark.sparkContext.getConf().getAll():
    #     print(f"{key}: {value}")

    # spark.sql("SHOW CATALOGS").show()
    # spark.sql("SHOW DATABASES").show()

    # # sc = spark.sparkContext
    # # sc.setLogLevel("ERROR")

    # spark.sql("""
    # CREATE TABLE IF NOT EXISTS uday_minio_catalog.product (
    # id INT,
    # name STRING,
    # price INT
    # ) USING iceberg""")

    # spark.sql("""
    # INSERT INTO uday_minio_catalog.product VALUES
    # (1, 'laptop', 50000),
    # (2, 'workstation', 100000),
    # (3, 'server', 250000)
    # """)

    # spark.sql("SELECT * FROM uday_minio_catalog.product").show(truncate=False)

    # # spark.stop()
