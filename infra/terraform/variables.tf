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

variable "lambda_runtime" {
  description = "Runtime used by backend Lambda."
  type        = string
  default     = "nodejs22.x"
}

variable "lambda_memory_size" {
  description = "Memory size in MB for backend Lambda."
  type        = number
  default     = 256
}

variable "lambda_timeout_seconds" {
  description = "Timeout in seconds for backend Lambda."
  type        = number
  default     = 10
}

variable "frontend_allowed_origins" {
  description = "Allowed CORS origins for backend API."
  type        = list(string)
  default     = ["http://localhost:3000"]
}

variable "enable_bucket_force_destroy" {
  description = "If true, S3 buckets are force-destroyed with their contents."
  type        = bool
  default     = false
}

variable "cognito_deletion_protection" {
  description = "Cognito deletion protection mode (ACTIVE or INACTIVE)."
  type        = string
  default     = "INACTIVE"
}
