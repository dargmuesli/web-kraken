# base-image
FROM python:3.11.9 AS base-image

ENV CI=true
ENV PYTHONUNBUFFERED=1

WORKDIR /srv/app/

RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update \
    && apt-get install --no-install-recommends -y \
        python3-poetry default-jre \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd rootless \
    && useradd -g rootless -m rootless

USER rootless:rootless
# `rootless:rootless` is equivalent to `1000:1000`

RUN mkdir /home/rootless/dagster \
  && touch /home/rootless/dagster/dagster.yaml \
  && poetry config virtualenvs.in-project true

ENV DAGSTER_HOME=/home/rootless/dagster

# development
FROM base-image AS development

COPY ./orchestration/docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["poetry", "run", "dagster", "dev", "--host", "0.0.0.0"]
VOLUME /srv/app
EXPOSE 3000


# prepare
FROM base-image AS prepare

COPY --chown=rootless ./orchestration/pyproject.toml ./orchestration/poetry.lock ./orchestration/

WORKDIR /srv/app/orchestration

RUN poetry install


# build
FROM prepare AS build

WORKDIR /srv/app

COPY --chown=rootless ./orchestration ./orchestration
COPY --chown=rootless ./transformation ./transformation

WORKDIR /srv/app/orchestration

RUN poetry run dagster-dbt project prepare-and-package --file orchestration/project.py


# production
FROM build AS production

ENV DAGSTER_DEPLOYMENT=production

USER root:root

RUN apt update \
    && apt upgrade -y \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

USER rootless:rootless

CMD ["poetry", "run", "dagster-webserver", "--host", "0.0.0.0"]
EXPOSE 3000
