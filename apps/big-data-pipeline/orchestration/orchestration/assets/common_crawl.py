from dagster import asset

from orchestration.utilities.common_crawl import fetch_warc_record_stream
from orchestration.utilities.performance import batch_process, batch_records, measure_performance
from orchestration.utilities.spark import SparkManager


@measure_performance
def write_source(batch: list, is_written: bool):
    spark_dataframe = SparkManager.spark.createDataFrame(batch)

    if is_written:
        spark_dataframe.writeTo("raw.source_common_crawl").append()
    else:
        spark_dataframe.writeTo("raw.source_common_crawl").createOrReplace()


@asset(compute_kind="python")
def source_common_crawl():
    # """Retrieves a table from Wikipedia, transforming it so that each top level domain is assigned an ISO 3166 country
    # code.
    # """
    warc_data_stream = fetch_warc_record_stream()
    warc_data_stream_batched = batch_records(warc_data_stream)
    batch_process(warc_data_stream_batched, write_source)
