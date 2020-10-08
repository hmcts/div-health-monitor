provider "azurerm" {
  features {}
}

locals {
  local_env = (var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env
  aseName = "core-compute-${var.env}"
  public_hostname = "${var.product}-${var.component}-${var.env}.service.${local.aseName}.internal"
}

