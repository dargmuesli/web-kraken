from dagster import asset

from orchestration.utilities.sources.country_codes import (
    fetch_tables,
    table_to_dataframe,
    write_source,
)
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
