from dagster import Definitions, load_assets_from_modules
from dagster_dbt import DbtCliResource

from .assets import dbt, intermediate
from .assets.sources import common_crawl, country_codes, web_technologies
from .project import transformation_project
from .schedules import schedules

defs = Definitions(
    assets=load_assets_from_modules([
        dbt, intermediate,
        common_crawl, country_codes, web_technologies]
    ),
    resources={
        "dbt": DbtCliResource(project_dir=transformation_project, target='internal'),
    },
    schedules=schedules,
)
