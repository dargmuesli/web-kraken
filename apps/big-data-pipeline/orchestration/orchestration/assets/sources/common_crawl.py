from dagster import asset

from orchestration.utilities.performance import batch_process, batch_records, measure_performance
from orchestration.utilities.sources.common_crawl import fetch_warc_record_stream
from orchestration.utilities.spark import SparkManager


@measure_performance
def write_source(batch: list, is_written: bool):
    spark_dataframe = SparkManager.spark.createDataFrame(batch)

    if is_written:
        spark_dataframe.writeTo("raw.source_common_crawl").append()
    else:
        spark_dataframe.writeTo("raw.source_common_crawl").partitionedBy("dataset_id", "response_charset").createOrReplace()


@asset(compute_kind="python")
def source_common_crawl():
    """Ingests Common Crawl's WARC files."""
    warc_data_stream = fetch_warc_record_stream()
    warc_data_stream_batched = batch_records(warc_data_stream)
    batch_process(warc_data_stream_batched, write_source)

    # SparkManager.spark.sql("ALTER TABLE raw.source_common_crawl ADD PARTITION FIELD dataset_id")
    # SparkManager.spark.sql("CALL demo.system.rewrite_data_files('raw.source_common_crawl', target-file-size-bytes => 256000)")
    # SparkManager.spark.sql("CALL demo.system.rewrite_manifests('raw.source_common_crawl')") SparkManager.spark.sql(
    # "CALL demo.system.expire_snapshots(table => 'raw.source_common_crawl', older_than => timestamp '2099-01-01
    # 04:20:00', retain_last => 1)")
