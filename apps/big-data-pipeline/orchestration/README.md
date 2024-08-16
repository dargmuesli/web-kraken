# Big Data Pipeline: orchestration

This is a [Dagster](https://dagster.io/) project.

## Getting started

First, set up [Poetry](https://python-poetry.org/). Then use it to install the dependencies:

```bash
poetry install
```

After that, start the Dagster UI web server:

```bash
poetry run dagster dev
```

Open http://localhost:3000 with your browser to see the project.

You can edit assets in `orchestration/assets.py`. The assets are automatically loaded into the Dagster code location as you define them.

## Development

### Adding new Python dependencies

You can specify new Python dependencies in `pyproject.toml`.

### Unit testing

Tests are in the `tests` directory and you can run tests using `pytest`:

```bash
poetry run pytest
```

### Schedules and sensors

If you want to enable Dagster [Schedules](https://docs.dagster.io/concepts/partitions-schedules-sensors/schedules) or [Sensors](https://docs.dagster.io/concepts/partitions-schedules-sensors/sensors) for jobs, the [Dagster Daemon](https://docs.dagster.io/deployment/dagster-daemon) process must be running. This is done automatically when you run `dagster dev`.

Once your Dagster Daemon is running, you can start turning on schedules and sensors for your jobs.

## Dagster Cloud

If you're looking for a hosted solution, check out the [Dagster Cloud Documentation](https://docs.dagster.cloud).
