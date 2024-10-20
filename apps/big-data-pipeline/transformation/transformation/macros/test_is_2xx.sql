{% macro test_is_2xx(model, column_name) %}

SELECT
  *
FROM {{ model }}
WHERE ({{ column_name }} < 200 OR {{ column_name }} >= 300)

{% endmacro %}
