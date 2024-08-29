WITH country_codes AS (
  SELECT
    *
  -- FROM {{ ref('seed_country_codes') }}
  FROM {{ source('raw', 'source_country_codes') }}
  WHERE NOT (country_code = 'BQ' AND top_level_domain = '.nl') -- exclude an unwanted ambiguity
)

-- , final AS (
--     SELECT
--       *
--     FROM country_codes
-- )

SELECT * FROM country_codes
