#!/bin/bash
# https://openapi-generator.tech/docs/usage

function build_openapi() {
    SCHEMA_PATH="openapi/sdxl_worker_api.yaml"
    echo "generating for $SCHEMA_PATH"
    rm -rf openapi/clients
    openapi-generator-cli validate -i "$SCHEMA_PATH"
    openapi-generator-cli generate -i "$SCHEMA_PATH" -g typescript-fetch -o openapi/clients/typescript-fetch
    openapi-generator-cli generate -i "$SCHEMA_PATH" -g python -o openapi/clients/python --package-name mooove_server_api
    uv build openapi/clients/python --out-dir server/openapi/dist
    read name version <<< "$(uv --directory openapi/clients/python version)"
    uv add --directory server openapi/dist/mooove_server_api-$version-py3-none-any.whl
}
   
if [[ "$1" == "--openapi" ]]; then
    build_openapi
else
    build_openapi
fi
   