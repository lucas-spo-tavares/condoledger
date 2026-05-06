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
  description = "Primary database connection string for the Amplify app."
  type        = string
  sensitive   = true
}

variable "direct_database_url" {
  description = "Direct database connection string used by Prisma config and migrations."
  type        = string
  sensitive   = true
}

variable "amplify_repository_url" {
  description = "Git repository URL for the Amplify app."
  type        = string
}

variable "amplify_access_token" {
  description = "GitHub access token used by Amplify to connect the repository. This value is stored in Terraform state."
  type        = string
  sensitive   = true
}

variable "amplify_branch_name" {
  description = "Repository branch that Amplify should deploy."
  type        = string
  default     = "main"
}

variable "amplify_environment_variables" {
  description = "Additional environment variables for the Amplify app."
  type        = map(string)
  default     = {}
}
