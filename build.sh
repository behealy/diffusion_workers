#!/bin/bash
# https://openapi-generator.tech/docs/usage
function build_openapi() {
    SCHEMA_PATH="openapi/sdxl_worker_api.yaml"
    echo "generating for $SCHEMA_PATH"
    rm -rf openapi/clients
    openapi-generator-cli validate -i "$SCHEMA_PATH"
    openapi-generator-cli generate -i "$SCHEMA_PATH" -g typescript-fetch -o openapi/clients/typescript-fetch
    openapi-generator-cli generate -i "$SCHEMA_PATH" -g python -o openapi/clients/python --package-name mooove_server_api
}

function install_openapi_lib_debug() {
    build_openapi
    cd server
    uv pip install -e ../openapi/clients/python --config-settings editable_mode=compat
    cd -
}

function install_openapi_lib() {
    build_openapi
    uv build openapi/clients/python --out-dir server/openapi/dist
    read name version <<< "$(uv --directory openapi/clients/python version)"
    uv add --directory server openapi/dist/mooove_server_api-$version-py3-none-any.whl
}
   
if [[ "$1" == "install_openapi_lib" ]]; then
    install_openapi_lib
else
    install_openapi_lib_debug
fi
   