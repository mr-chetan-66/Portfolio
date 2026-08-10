locals {
  name_prefix = "${var.project_name}-${var.environment}"
  use_custom_domain = var.domain_name != "" && var.route53_zone_name != ""

  tags = {
    Project     = "Cloud Portfolio Platform"
    Owner       = "Chetan Awari"
    Environment = var.environment
    ManagedBy   = "Terraform"
    CostProfile = "FreeTierAware"
  }
}
