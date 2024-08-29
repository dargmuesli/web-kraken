{% macro generate_schema_name(custom_schema_name, node) -%}

    {%- set default_schema = target.schema -%}
    {%- if custom_schema_name is none -%}

        {{ default_schema }}

    {%- else -%}

        {# do not prefix with `default_schema` as in: #}
        {# {{ default_schema }}_{{ custom_schema_name | trim }} #}
        {{ custom_schema_name | trim }}

    {%- endif -%}

{%- endmacro %}
