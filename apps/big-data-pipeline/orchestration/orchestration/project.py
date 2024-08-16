from pathlib import Path

from dagster_dbt import DbtProject

transformation_project = DbtProject(
    project_dir=Path(__file__).joinpath("..", "..", "..", "transformation").resolve(),
    # packaged_project_dir=Path(__file__).joinpath("..", "..", "..", "transformation-package").resolve(),
)
transformation_project.prepare_if_dev()
