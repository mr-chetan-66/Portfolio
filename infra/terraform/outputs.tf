output "s3_bucket_name" {
  description = "Private S3 bucket used by GitHub Actions."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidations."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront URL for the AWS-hosted portfolio."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "github_actions_role_arn" {
  description = "IAM role ARN to place in GitHub repo variable AWS_ROLE_ARN."
  value       = aws_iam_role.github_deploy.arn
}

output "route53_domain_name" {
  description = "Custom domain configured through Route 53, if enabled."
  value       = local.use_custom_domain ? var.domain_name : ""
}
