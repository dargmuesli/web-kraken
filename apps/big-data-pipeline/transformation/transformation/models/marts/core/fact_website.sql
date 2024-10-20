WITH websites AS (
  SELECT
    *
  FROM {{ source('intermediate', 'intermediate') }}
),
-- WITH web_technologies AS (
--   SELECT
--     name
--   FROM {{ ref('dimension_web_technology') }}
-- ),

final AS (
  SELECT
    x AS country,
    x AS domain,
    x AS web_technology_id,
  FROM websites
  LEFT JOIN web_technologies
    ON websites.web_technologies = web_technologies.name
)

SELECT * FROM final -- `final` can be changed to `custom` or others to troubleshoot
