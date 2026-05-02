variable "aws_region" {
  description = "AWS region used by CondoLedger."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
  default     = "condoledger"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"
}

variable "allowed_callback_urls" {
  description = "Allowed callback URLs for Cognito clients."
  type        = list(string)
  default     = ["http://localhost:3000/api/auth/callback/cognito"]
}

variable "allowed_logout_urls" {
  description = "Allowed logout URLs for Cognito clients."
  type        = list(string)
  default     = ["http://localhost:3000/sign-in"]
}
