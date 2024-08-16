import pandas as pd
from pyspark.sql import SparkSession

from orchestration.utilities.performance import measure_performance


class SparkSingleton:
    def __init__(self):
        self._spark = None

    @property
    def spark(self):
        if self._spark is None:
            self._spark = SparkSession.builder \
                .appName("Big Data Pipeline") \
                .master("spark://spark-iceberg:7077") \
                .config("spark.driver.memory", "3g") \
                .config("spark.executor.memory", "3g") \
                .config("spark.sql.extensions", "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions") \
                .config("spark.sql.catalog.demo", "org.apache.iceberg.spark.SparkCatalog") \
                .config("spark.sql.catalog.demo.type", "rest") \
                .config("spark.sql.catalog.demo.uri", "http://rest:8181") \
                .config("spark.sql.catalog.demo.io-impl", "org.apache.iceberg.aws.s3.S3FileIO") \
                .config("spark.sql.catalog.demo.s3.endpoint", "http://minio:9000") \
                .config("spark.sql.catalog.demo.s3.path-style-access", "true") \
                .config("spark.sql.defaultCatalog", "demo") \
                .config("spark.sql.catalogImplementation", "in-memory") \
                .config("spark.jars.packages", "org.apache.iceberg:iceberg-spark-runtime-3.5_2.12:1.6.1,"
                                               "org.apache.iceberg:iceberg-aws-bundle:1.6.1") \
                .getOrCreate()
        # TODO: add jars to docker image
        return self._spark


SparkManager = SparkSingleton()


@measure_performance
def convert_pandas_to_spark_dataframe(pandas_dataframe: pd.DataFrame):
    spark_dataframe = SparkManager.spark.createDataFrame(pandas_dataframe)
    return spark_dataframe
