SELECT
    -- TODO: `cats as category_ids,` as an exemplary point for extension
    description,
    html AS html_regular_expressions,
    name,
    website
  FROM {{ source('raw', 'source_web_technologies') }} -- FROM {{ ref('seed_web_technologies') }}
  WHERE html IS NOT NULL AND name IS NOT NULL
