variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "callmemaybe"
}

# EC2 Configuration
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
}

variable "domain_name" {
  description = "Domain name for Caddy SSL certificate"
  type        = string
}

# Email Configuration
variable "notification_email" {
  description = "Email address to receive call notifications"
  type        = string
}

variable "sender_email" {
  description = "Email address to send notifications from (must be verified in SES)"
  type        = string
}

# S3 Configuration
variable "transcript_retention_days" {
  description = "Number of days to retain transcripts before deletion (0 to disable)"
  type        = number
  default     = 90
}

variable "transcript_ia_transition_days" {
  description = "Number of days before transitioning transcripts to Infrequent Access"
  type        = number
  default     = 30
}

# GitHub Configuration 
variable "github_repo" {
  description = "GitHub repository (e.g., username/repo)"
  type        = string
}

variable "create_github_oidc" {
  description = "Whether to create the GitHub OIDC provider (set to false if it already exists in your account)"
  type        = bool
  default     = true
}
