import pandas as pd
import pyspark

from orchestration.utilities.performance import measure_performance
from orchestration.utilities.pickles import get_pickle_path

# Other sources:
# https://www.iana.org/domains/root/db
COUNTRY_CODES_URL = "https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes"


@measure_performance
def fetch_tables() -> list[pd.DataFrame]:
    # without `keep_default_na` the country code for Namibia `NA` would be parsed as `NoneType`
    tables = pd.read_html(COUNTRY_CODES_URL, keep_default_na=False)
    return tables


@measure_performance
def table_to_dataframe(table: pd.DataFrame) -> pd.DataFrame:
    """Retrieves a table from Wikipedia, transforming it so that each top-level domain is assigned an ISO 3166 country
    code.
    """
    selected_columns: pd.DataFrame = table.iloc[:, [3, 7]]
    selected_columns.columns = ['country_code', 'top_level_domain']

    valid_country_codes = selected_columns[selected_columns['country_code'].str.match(r'^[A-Z]{2}$')]
    valid_country_codes.loc[:, 'top_level_domain'] = valid_country_codes['top_level_domain'].str.replace(r'\[.*?\]', '',
                                                                                                         regex=True)
    valid_country_codes.loc[:, 'top_level_domain'] = valid_country_codes['top_level_domain'].str.replace('.', '')
    valid_country_codes.loc[:, 'top_level_domain'] = valid_country_codes['top_level_domain'].str.strip()
    valid_top_level_domains = valid_country_codes[valid_country_codes['top_level_domain'] != '']
    split_top_level_domains = valid_top_level_domains.assign(
        top_level_domain=valid_top_level_domains['top_level_domain'].str.split()).explode(
        'top_level_domain')

    return split_top_level_domains


@measure_performance
def write_pickle(dataframe: pd.DataFrame, path: str):
    dataframe.to_csv(path, index=False)


@measure_performance
def write_source(spark_dataframe: pyspark.sql.DataFrame):
    spark_dataframe.writeTo("raw.source_country_codes").createOrReplace()


def create_pickle():
    tables = fetch_tables()
    dataframe = table_to_dataframe(tables[0])
    write_pickle(dataframe, get_pickle_path("country_codes"))


if __name__ == '__main__':
    create_pickle()
