# ─── ECR: Container Registry ────────────────────────────────
module "ecr" {
  source   = "../../modules/ecr"
  app_name = var.app_name
}

# ─── IAM: EC2 Role with CloudWatch + ECR permissions ────────
module "iam" {
  source   = "../../modules/iam"
  app_name = var.app_name
}

# ─── EC2: The application server ────────────────────────────
module "ec2" {
  source = "../../modules/ec2"

  app_name          = var.app_name
  environment       = var.environment
  instance_type     = var.ec2_instance_type
  ami               = var.ec2_ami
  key_pair_name     = var.key_pair_name
  allowed_ssh_cidr  = var.allowed_ssh_cidr
  iam_instance_profile = module.iam.instance_profile_name
  ecr_repository_url   = module.ecr.repository_url
  aws_region           = var.aws_region
}

# ─── CloudFront: CDN in front of EC2 ────────────────────────
module "cloudfront" {
  source = "../../modules/cloudfront"

  app_name       = var.app_name
  ec2_public_dns = module.ec2.public_dns
}
