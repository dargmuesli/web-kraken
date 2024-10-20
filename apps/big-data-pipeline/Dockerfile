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

RUN mkdir /home/rootless/dagster \
  && touch /home/rootless/dagster/dagster.yaml \
  && poetry config virtualenvs.in-project true

COPY ./orchestration/docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENV DAGSTER_HOME=/home/rootless/dagster

# development
FROM base-image AS development

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["poetry", "run", "dagster", "dev", "--host", "0.0.0.0"]
VOLUME /srv/app
EXPOSE 3000


# build
FROM base-image AS build

COPY --chown=rootless ./orchestration ./orchestration
COPY --chown=rootless ./transformation ./transformation

WORKDIR /srv/app/orchestration

RUN poetry install && poetry run dagster-dbt project prepare-and-package --file orchestration/project.py


# production
FROM build AS production

ENV DAGSTER_DEPLOYMENT=production

CMD ["poetry", "run", "dagster-webserver", "--host", "0.0.0.0"]
EXPOSE 3000
