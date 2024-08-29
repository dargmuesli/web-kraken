WITH common_crawl AS (
  SELECT
    *
  FROM {{ ref('seed_common_crawl') }}
  -- FROM {{ source('raw', 'source_common_crawl') }}
)

-- , final AS (
--     SELECT
--       *
--     FROM common_crawl
-- )

SELECT * FROM common_crawl
