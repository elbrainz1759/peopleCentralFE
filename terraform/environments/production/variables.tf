variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name used for naming resources"
  type        = string
  default     = "people-central-fe"
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro" # Free tier eligible
}

variable "ec2_ami" {
  description = "Ubuntu 22.04 LTS AMI (us-east-1). Update if deploying in a different region."
  type        = string
  default     = "ami-0c7217cdde317cfec"
}

variable "key_pair_name" {
  description = "Name of your existing AWS key pair for SSH access"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "Your IP address in CIDR format for SSH access. Use x.x.x.x/32 for a single IP."
  type        = string
  default     = "0.0.0.0/0" # Restrict this to your IP in production
}

variable "ecr_repository_url" {
  description = "ECR repository URL for the Docker image"
  type        = string
  default     = "" # Set after ECR module creates it
}
