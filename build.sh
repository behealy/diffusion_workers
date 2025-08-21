#!/bin/bash
# https://openapi-generator.tech/docs/usage

OPENAPI_CLIENT_LIBS_DIR="openapi/client_libs"

# Build the openapi client libraries for the EZ Diffusion Api.
function build_openapi() {
    SCHEMA_PATH="openapi/ez_diffusion_api.yaml"
    echo "generating for $SCHEMA_PATH"
    rm -rf $OPENAPI_CLIENT_LIBS_DIR
    openapi-generator-cli validate -i "$SCHEMA_PATH"
    openapi-generator-cli generate -i "$SCHEMA_PATH" -g typescript-fetch -o $OPENAPI_CLIENT_LIBS_DIR/typescript
    openapi-generator-cli generate -i "$SCHEMA_PATH" -g python -o $OPENAPI_CLIENT_LIBS_DIR/python --package-name ez_diffusion_client
}

function install_openapi_lib_debug() {
    build_openapi
    cd server
    uv pip install -e ../$OPENAPI_CLIENT_LIBS_DIR/python --config-settings editable_mode=compat
    cd -

    rm -rf basic_client/lib/ezdiffusion
    mkdir -p basic_client/lib/ezdiffusion
    cp -r $OPENAPI_CLIENT_LIBS_DIR/typescript/** basic_client/lib/ezdiffusion

}

function install_openapi_lib() {
    build_openapi
    uv build $OPENAPI_CLIENT_LIBS_DIR/python --out-dir server/openapi/dist
    read name version <<< "$(uv --directory $OPENAPI_CLIENT_LIBS_DIR/python version)"
    uv add --directory server openapi/dist/mooove_server_api-$version-py3-none-any.whl
}
   
if [[ "$1" == "install_openapi_lib" ]]; then
    install_openapi_lib
else
    install_openapi_lib_debug
fi
   