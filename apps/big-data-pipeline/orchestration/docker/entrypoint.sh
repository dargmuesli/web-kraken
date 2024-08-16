#!/bin/sh
set -e

if [ "$NODE_ENV" != "production" ]; then
    poetry install
fi

exec "$@"
