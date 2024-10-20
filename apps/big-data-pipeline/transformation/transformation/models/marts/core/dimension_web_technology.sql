SELECT
    -- ROW_NUMBER() OVER (ORDER BY name) AS id,
    description,
    -- not selecting `html_regular_expression`
    name,
    website
  FROM {{ ref('staging_web_technologies') }}
