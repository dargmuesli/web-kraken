import time
from typing import Generator

from orchestration.utilities.logs import logger


def batch_process(data_stream: Generator, func):
    is_written = False

    for batch in data_stream:
        func(batch, is_written)

        if not is_written:
            is_written = True


def batch_records(data: Generator, batch_size=1000, limit_records=None):
    counter = 0
    batch = []

    for record in data:
        if limit_records and counter >= limit_records:
            break

        batch.append(record)
        counter += 1

        if len(batch) == batch_size:
            yield batch
            batch = []

    if batch:
        yield batch


def measure_performance(func):
    """Decorator to measure the execution time of a function."""

    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        logger.info(f"Time to execute {func.__name__}: {elapsed_time:.4f} seconds")
        return result

    return wrapper
