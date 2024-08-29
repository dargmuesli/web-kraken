WITH websites AS (
  SELECT
    *
  FROM {{ ref('staging_common_crawl')}}
),
WITH country_codes AS (
  SELECT
    *
  FROM {{ ref('staging_country_codes')}}
),

custom AS (
  SELECT id
  FROM websites
),

final AS (
  SELECT
    x AS country,
    x AS domain,
    x AS framework_id,
  FROM websites
  LEFT JOIN custom
    ON websites.id = custom.id
)

SELECT * FROM final -- `final` can be changed to `custom` or others to troubleshoot
