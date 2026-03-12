terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state stored in S3 — you create this bucket manually once
  # Run: aws s3 mb s3://people-central-terraform-state --region us-east-1
  backend "s3" {
    bucket         = "people-central-terraform-state"
    key            = "production/frontend/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    # Optional: enable state locking with DynamoDB
    # dynamodb_table = "people-central-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "PeopleCentral"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
