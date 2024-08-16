from dagster import asset

from orchestration.utilities.sources.web_technologies import (
    fetch_technologies,
    technologies_to_dataframe,
    write_source,
)
from orchestration.utilities.spark import convert_pandas_to_spark_dataframe


@asset(compute_kind="python")
def source_web_technologies():
    """Retrieves names and regular expressions to match against the DOM for web technologies."""
    technologies = fetch_technologies()
    dataframe = technologies_to_dataframe(technologies)
    spark_dataframe = convert_pandas_to_spark_dataframe(dataframe)
    write_source(spark_dataframe)
