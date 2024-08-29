WITH frameworks AS (
  SELECT
    *
  FROM {{ ref('staging_common_crawl')}}
),

custom AS (
  SELECT
    id
    size
  FROM frameworks
),

final AS (
  SELECT
    frameworks.id AS id,
    custom.size AS name
  FROM frameworks
  LEFT JOIN custom
    ON frameworks.id = custom.id
)

SELECT * FROM final -- `final` can be changed to `custom` or others to troubleshoot
