# base-image
FROM python:3.12.5-slim AS base-image

ENV CI=true
ENV PYTHONUNBUFFERED=1

WORKDIR /srv/app/

RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update \
    && apt-get install --no-install-recommends -y \
        python3-poetry \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd rootless \
    && useradd -g rootless -m rootless

USER rootless:rootless

RUN poetry config virtualenvs.in-project true

COPY ./docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# development
FROM base-image AS development

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["poetry", "run", "dagster", "dev", "--host", "0.0.0.0"]
VOLUME /srv/app
EXPOSE 3000
