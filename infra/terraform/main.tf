provider "aws" {
  region = var.aws_region
}

locals {
  name = "${var.project_name}-${var.environment}"

  tags = {
    Project     = "CondoLedger"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket" "proofs" {
  bucket_prefix = "${local.name}-proofs-"
  force_destroy = var.enable_bucket_force_destroy

  tags = local.tags
}

resource "aws_s3_bucket_public_access_block" "proofs" {
  bucket                  = aws_s3_bucket.proofs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "proofs" {
  bucket = aws_s3_bucket.proofs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_cognito_user_pool" "main" {
  name                     = local.name
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  deletion_protection      = var.cognito_deletion_protection

  sign_in_policy {
    allowed_first_auth_factors = ["PASSWORD", "EMAIL_OTP"]
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true

    string_attribute_constraints {
      min_length = 5
      max_length = 2048
    }
  }

  tags = local.tags
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.name}-web"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret                      = false
  prevent_user_existence_errors        = "ENABLED"
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  callback_urls                        = var.allowed_callback_urls
  logout_urls                          = var.allowed_logout_urls
  explicit_auth_flows                  = ["ALLOW_USER_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]

  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_group" "admins" {
  name         = "Admins"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "CondoLedger administrators."
}

resource "aws_cognito_user_group" "residents" {
  name         = "Residents"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "CondoLedger residents with scoped portal access."
}

resource "aws_iam_role" "amplify_service" {
  name = "${local.name}-amplify-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Statement1"
        Effect = "Allow"
        Principal = {
          Service = ["amplify.amazonaws.com"]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "amplify_service" {
  role       = aws_iam_role.amplify_service.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

resource "aws_iam_role" "amplify_compute" {
  name = "${local.name}-amplify-compute-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Statement1"
        Effect = "Allow"
        Principal = {
          Service = ["amplify.amazonaws.com"]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_policy" "amplify_compute_proofs" {
  name        = "${local.name}-amplify-compute-proofs"
  description = "Allows Amplify SSR compute to access the proofs bucket."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListProofsBucket"
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.proofs.arn
      },
      {
        Sid    = "ManageProofObjects"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.proofs.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "amplify_compute" {
  role       = aws_iam_role.amplify_compute.name
  policy_arn = aws_iam_policy.amplify_compute_proofs.arn
}

resource "aws_amplify_app" "web" {
  name                 = local.name
  description          = "CondoLedger Next.js SSR app"
  repository           = var.amplify_repository_url
  platform             = "WEB_COMPUTE"
  access_token         = var.amplify_access_token
  iam_service_role_arn = aws_iam_role.amplify_service.arn
  compute_role_arn     = aws_iam_role.amplify_compute.arn

  enable_branch_auto_build = true

  environment_variables = merge(
    {
      AUTH_MODE            = "cognito"
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.web.id
      PROOFS_BUCKET_NAME   = aws_s3_bucket.proofs.bucket
      DATABASE_URL         = var.database_url
      DIRECT_DATABASE_URL  = var.direct_database_url
    },
    var.amplify_environment_variables
  )

  build_spec = file("${path.module}/amplify.yml")

  depends_on = [
    aws_iam_role_policy_attachment.amplify_service,
    aws_iam_role_policy_attachment.amplify_compute
  ]

  tags = local.tags
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.web.id
  branch_name = var.amplify_branch_name

  enable_auto_build = true
}
