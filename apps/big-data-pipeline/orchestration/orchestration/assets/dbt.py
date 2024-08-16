from dagster import (
    AssetExecutionContext,
)
from dagster_dbt import DbtCliResource, dbt_assets

from ..project import transformation_project


@dbt_assets(manifest=transformation_project.manifest_path)
def transformation_dbt_assets(context: AssetExecutionContext, dbt: DbtCliResource):
    yield from dbt.cli(["build"], context=context).stream()
