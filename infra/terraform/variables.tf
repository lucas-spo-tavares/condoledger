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

variable "database_url" {
  description = "Primary database connection string."
  type        = string
  sensitive   = true
  default     = null
}

variable "direct_database_url" {
  description = "Direct database connection string used by Prisma config and migrations."
  type        = string
  sensitive   = true
  default     = null
}

variable "enable_web_app" {
  description = "If true, provisions the standalone Next.js Lambda and CloudFront distribution."
  type        = bool
  default     = false
}

variable "lambda_runtime" {
  description = "Node.js runtime used by the standalone Next.js Lambda."
  type        = string
  default     = "nodejs22.x"
}

variable "lambda_architecture" {
  description = "Instruction set architecture used by the standalone Next.js Lambda."
  type        = string
  default     = "x86_64"
}

variable "lambda_memory_size" {
  description = "Memory size in MB for the standalone Next.js Lambda."
  type        = number
  default     = 1024
}

variable "lambda_timeout_seconds" {
  description = "Timeout in seconds for the standalone Next.js Lambda."
  type        = number
  default     = 30
}

variable "lambda_log_retention_days" {
  description = "CloudWatch log retention in days for the standalone Next.js Lambda."
  type        = number
  default     = 14
}

variable "lambda_web_adapter_layer_arn" {
  description = "AWS Lambda Web Adapter layer ARN for the selected region and architecture."
  type        = string
  default     = null
}

variable "cloudfront_price_class" {
  description = "CloudFront price class for the web distribution."
  type        = string
  default     = "PriceClass_100"
}
