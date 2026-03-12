output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = module.ec2.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = module.ec2.public_dns
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain — use this as your app URL"
  value       = module.cloudfront.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — needed for cache invalidations in CI/CD"
  value       = module.cloudfront.distribution_id
}

output "ecr_repository_url" {
  description = "ECR repository URL — add this as a GitHub secret"
  value       = module.ecr.repository_url
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = module.ec2.instance_id
}
