// Infrastructural variables

variable "reform_team" {
  default = "div"
}

variable "reform_service_name" {
  default = "hm"
}

variable "product" {}

variable "raw_product" {
  default = "div"
}

variable "location" {
  default = "UK South"
}

variable "env" {}

variable "ilbIp" {}

variable "deployment_env" {}

variable "deployment_path" {
  default = "/opt/divorce/frontend"
}

variable "node_config_dir" {
  // for Unix
  // default = "/opt/divorce/frontend/config"

  // for Windows
  default = "D:\\home\\site\\wwwroot\\config"
}

variable "subscription" {}

// CNP settings
variable "jenkins_AAD_objectId" {
  description                 = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "tenant_id" {
  description = "(Required) The Azure Active Directory tenant ID that should be used for authenticating requests to the key vault. This is usually sourced from environemnt variables and not normally required to be specified."
}

variable "node_env" {
  default = "production"
}

variable "node_path" {
  default = "."
}

variable "additional_host_name" {}

variable "packages_version" {
  default = "-1"
}

variable "public_protocol" {
  default = "https"
}

variable "frontend_service_name" {
  default = "divorce-health-monitor"
}

variable "component" {}

variable "capacity" {
  default = "1"
}

variable "common_tags" {
  type = map(string)
}
