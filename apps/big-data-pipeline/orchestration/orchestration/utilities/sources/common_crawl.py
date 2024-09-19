import codecs
import gzip
from urllib.parse import urljoin

import pandas as pd
import requests
from fastwarc import ArchiveIterator, WarcRecordType

from orchestration.utilities.logs import logger
from orchestration.utilities.performance import batch_process, batch_records, measure_performance
from orchestration.utilities.pickles import get_pickle_path

MODULE_NAME = 'common_crawl'


@measure_performance
def fetch_warc_datasets():
    url = "https://index.commoncrawl.org/collinfo.json"

    response = requests.get(url)
    response.raise_for_status()
    datasets = response.json()

    if not datasets:
        raise ValueError("No datasets found.")

    return datasets


@measure_performance
def fetch_warc_paths(dataset_id: str):
    warc_paths_url = urljoin('https://data.commoncrawl.org/', f'crawl-data/{dataset_id}/warc.paths.gz')

    response = requests.get(warc_paths_url)
    response.raise_for_status()

    warc_paths = gzip.decompress(response.content).decode('utf-8').splitlines()

    if not warc_paths:
        raise ValueError("No warc paths found.")

    return warc_paths


@measure_performance
def fetch_warc_stream(warc_file: str):
    warc_url = urljoin('https://data.commoncrawl.org/', warc_file)
    warc_response = requests.get(warc_url, stream=True)
    warc_response.raise_for_status()
    return warc_response


@measure_performance
def get_warc_record_stream(archive_stream: ArchiveIterator, dataset_id: str, filter_short_html=False):
    success_counter = 0
    failure_counter = 0

    for record in archive_stream:
        if not record.is_http_parsed:
            raise NotImplementedError(
                f"The record for `{record.headers.get('WARC-Target-URI')}` is not a parsed HTTP record.")

        # skip non-html content like PDFs or XML files
        if record.http_content_type != 'text/html':
            continue

        if record.record_type != WarcRecordType.response:
            raise NotImplementedError(
                f'This demonstration currently only supports `response` data. Record type `{record.record_type.name}` '
                f'is not supported.')

        if record.http_headers.status_code != 200:
            raise NotImplementedError(f'This demonstration currently expects to receive only successfully fetched '
                                      f'data. Status code `{record.http_headers.status_code}` is not supported.')

        if record.http_charset:
            try:
                codecs.lookup(record.http_charset)
            except LookupError:
                raise NotImplementedError(f'The HTTP charset `{record.http_charset}` is unknown.')
        response_charset = record.http_charset

        response_target_uri = record.headers.get('WARC-Target-URI')
        if not response_target_uri:
            raise NotImplementedError(f'The target URI seems to be missing for record ID `{record.record_id}`.')

        response_payload = record.reader.read()

        try:
            response_payload_decoded = response_payload.decode(response_charset or 'utf-8')
        except UnicodeDecodeError:
            logger.debug(f'Cannot decode record payload for target URI `{response_target_uri}` '
                         f'(successful decodings: {success_counter}, failures: {failure_counter}, '
                         f'failure ratio: {(failure_counter / (failure_counter + success_counter)):.2%}).')
            failure_counter += 1
            continue

        response_payload_decoded_length = len(response_payload_decoded)

        # files larger than this lead to warnings in LibreOffice Calc, dbt's limit is 131072 characters
        if filter_short_html and response_payload_decoded_length > 75000:
            logger.debug(f'Skipping long HTML with length of {response_payload_decoded_length}.')
            continue

        success_counter += 1

        yield {
            'dataset_id': dataset_id,
            'response_charset': response_charset,
            'response_headers_status_code': record.http_headers.status_code,
            'response_payload': response_payload_decoded,
            'response_payload_size': response_payload_decoded_length,
            'response_target_uri': response_target_uri,
        }


@measure_performance
def write_pickle(batch: list, is_written: bool):
    dataframe = pd.DataFrame(batch)
    pickle_path = get_pickle_path(MODULE_NAME)
    dataframe.to_csv(pickle_path, mode='a' if is_written else 'w', index=False, header=not is_written)


def fetch_warc_record_stream(filter_short_html=False):
    warc_datasets = fetch_warc_datasets()
    most_recent_dataset = warc_datasets[0]
    dataset_id = most_recent_dataset['id']
    warc_paths = fetch_warc_paths(dataset_id)
    warc_stream = fetch_warc_stream(warc_paths[0])
    archive_stream = ArchiveIterator(warc_stream.raw, record_types=WarcRecordType.response)
    warc_record_stream = get_warc_record_stream(archive_stream, dataset_id=dataset_id,
                                                filter_short_html=filter_short_html)
    return warc_record_stream


def create_pickle():
    warc_record_stream = fetch_warc_record_stream(filter_short_html=True)
    warc_record_stream_batched = batch_records(warc_record_stream, limit_records=100)
    batch_process(warc_record_stream_batched, write_pickle)


if __name__ == '__main__':
    create_pickle()
