provider "azurerm" {
  version = "1.19.0"
}

locals {
  local_env = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
  aseName = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"
  public_hostname = "${var.product}-${var.component}-${var.env}.service.${local.aseName}.internal"
  asp_name = "${var.env == "prod" ? "div-hm-prod" : "${var.raw_product}-${var.env}"}"
  asp_rg = "${var.env == "prod" ? "div-hm-prod" : "${var.raw_product}-${var.env}"}"
}

module "frontend" {
  source = "git@github.com:hmcts/cnp-module-webapp.git?ref=master"
  product = "${var.product}-${var.reform_service_name}"
  location = "${var.location}"
  env = "${var.env}"
  ilbIp = "${var.ilbIp}"
  is_frontend = "${var.env != "preview" ? 1: 0}"
  subscription = "${var.subscription}"
  additional_host_name = "${var.env != "preview" ? var.additional_host_name : "null"}"
  https_only = "true"
  capacity = "${var.capacity}"
  common_tags = "${var.common_tags}"
  asp_name = "${local.asp_name}"
  asp_rg = "${local.asp_rg}"

  app_settings = {

    // Node specific vars
    NODE_ENV = "${var.node_env}"
    NODE_PATH = "${var.node_path}"

    // Packages
    PACKAGES_VERSION = "${var.packages_version}"

    NODE_CONFIG_DIR = "${var.node_config_dir}"

    // Logging vars
    REFORM_TEAM = "${var.reform_team}"
    REFORM_SERVICE_NAME = "${var.reform_service_name}"
    REFORM_ENVIRONMENT = "${var.env}"

    MONITOR_ENVIRONMENT = "${local.local_env}"

    DEPLOYMENT_ENV = "${var.deployment_env}"

    // Service name
    SERVICE_NAME = "${var.frontend_service_name}"
  }
}
