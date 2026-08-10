variable "project_name" {
  description = "Short project name used in AWS resource names."
  type        = string
  default     = "chetan-portfolio"
}

variable "aws_region" {
  description = "Primary AWS region for regional services."
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment label."
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Optional AWS-hosted portfolio domain, such as aws.chetanawari.com. Leave empty to use the CloudFront domain only."
  type        = string
  default     = ""
}

variable "route53_zone_name" {
  description = "Optional Route 53 hosted zone name, such as chetanawari.com. Required when domain_name is set."
  type        = string
  default     = ""
}

variable "github_owner" {
  description = "GitHub username or organization that owns the repository."
  type        = string
  default     = "mr-chetan-66"
}

variable "github_repo" {
  description = "GitHub repository name."
  type        = string
  default     = "Portfolio"
}

variable "create_github_oidc_provider" {
  description = "Set false if the AWS account already has a token.actions.githubusercontent.com OIDC provider."
  type        = bool
  default     = true
}

variable "monthly_budget_limit_usd" {
  description = "Monthly budget threshold in USD. Set 0 to skip budget creation."
  type        = number
  default     = 10
}

variable "budget_alert_emails" {
  description = "Email addresses that should receive AWS Budget alerts."
  type        = list(string)
  default     = []
}
