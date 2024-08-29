from dagster import Definitions, load_assets_from_modules
from dagster_dbt import DbtCliResource

from .assets import common_crawl, country_codes, dbt
from .project import transformation_project
from .schedules import schedules

defs = Definitions(
    assets=load_assets_from_modules([common_crawl, country_codes, dbt]),
    resources={
        "dbt": DbtCliResource(project_dir=transformation_project,target='internal'),
    },
    schedules=schedules,
)
