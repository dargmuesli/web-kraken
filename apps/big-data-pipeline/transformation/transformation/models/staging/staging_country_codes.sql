SELECT
    *
  FROM {{ source('raw', 'source_country_codes') }} -- FROM {{ ref('seed_country_codes') }}
  WHERE NOT (country_code = 'BQ' AND top_level_domain = 'nl') -- exclude an unwanted ambiguity
