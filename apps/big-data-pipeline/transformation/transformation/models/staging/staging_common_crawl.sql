SELECT
    *
  FROM {{ source('raw', 'source_common_crawl') }} -- FROM {{ ref('seed_common_crawl') }}
