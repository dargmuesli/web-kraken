#!/bin/sh
set -e

poetry install

exec "$@"
