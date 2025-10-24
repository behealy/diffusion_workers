variable "RELEASE" {
    default = "0.0.3"
}

group "default" {
    targets = ["wan22"]
}

target "wan22" {
    dockerfile = "Dockerfile"
    tags = ["behealy/rp_wan22:${RELEASE}"]
    args = {
        RELEASE = "${RELEASE}"
    }
    platforms = ["linux/amd64"]
}
