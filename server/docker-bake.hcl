variable "RELEASE" {
    default = "0.0.3"
}

group "default" {
    targets = ["wan22"]
}

target "sdxl" {
    dockerfile = "Dockerfile"
    tags = ["behealy/rpworker_sdxl:${RELEASE}"]
    args = {
        RELEASE = "${RELEASE}"
        PRELOAD_MANIFEST = "sdxl"
    }
    platforms = ["linux/amd64"]
}

target "ltxv" {
    dockerfile = "Dockerfile"
    tags = ["behealy/rpworker_ltxv:${RELEASE}"]
    args = {
        RELEASE = "${RELEASE}"
        PRELOAD_MANIFEST = "ltxv"
    }
    platforms = ["linux/amd64"]
}

target "wan22" {
    dockerfile = "Dockerfile"
    tags = ["behealy/rpworker_wan22:${RELEASE}"]
    args = {
        RELEASE = "${RELEASE}"
        PRELOAD_MANIFEST = "wan22"
    }
    platforms = ["linux/amd64"]
}
