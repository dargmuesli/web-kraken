import pandas as pd
import pyspark
import requests

from orchestration.utilities.performance import measure_performance
from orchestration.utilities.pickles import get_pickle_path

MODULE_NAME = "web_technologies"
SOURCE_URL = "https://raw.githubusercontent.com/tunetheweb/wappalyzer/master/src/technologies"
PICKLE_LIMIT = 100


@measure_performance
def fetch_technologies(limit=None) -> dict:
    technologies = {}

    for index in range(27):
        if limit and len(technologies) >= limit:
            break

        character = '_' if index == 0 else chr(index + 96)
        response = requests.get(f'{SOURCE_URL}/{character}.json')
        response.raise_for_status()
        technologies.update(response.json())

    return technologies


@measure_performance
def technologies_to_dataframe(technologies: dict, limit=None) -> pd.DataFrame:
    dataframe = pd.DataFrame([
        (
            value["cats"] if isinstance(value.get("cats", None), list) else (
                [value["cats"]] if value.get("cats", None) else None
            ),
            value.get("description", None),
            value["html"] if isinstance(value.get("html", None), list) else (
                [value["html"]] if value.get("html", None) else None
            ),
            key,
            value["website"]
        ) for key, value in technologies.items()
    ], columns=[
        'cats',
        'description',
        'html',
        'name',
        'website'
    ])

    if limit:
        dataframe = dataframe[:limit]

    # dataframe = dataframe.explode('html_regular_expressions')

    return dataframe


@measure_performance
def write_pickle(dataframe: pd.DataFrame, path: str):
    dataframe.to_csv(path, index=False)


@measure_performance
def write_source(spark_dataframe: pyspark.sql.DataFrame):
    spark_dataframe.writeTo(f"raw.source_{MODULE_NAME}").createOrReplace()


def create_pickle():
    technologies = fetch_technologies(limit=PICKLE_LIMIT)
    dataframe = technologies_to_dataframe(technologies, limit=PICKLE_LIMIT)
    pickle_path = get_pickle_path(MODULE_NAME)
    write_pickle(dataframe, pickle_path)


if __name__ == '__main__':
    create_pickle()
