provider "aws" {
  region = var.aws_region
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  count = var.enable_web_app ? 1 : 0
  name  = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host_header" {
  count = var.enable_web_app ? 1 : 0
  name  = "Managed-AllViewerExceptHostHeader"
}

locals {
  name = "${var.project_name}-${var.environment}"
  lambda_web_adapter_layer_arn = coalesce(
    var.lambda_web_adapter_layer_arn,
    "arn:aws:lambda:${var.aws_region}:753240598075:layer:LambdaAdapterLayerX86:27"
  )
  web_lambda_zip_path = "${path.module}/../lambda/condoledger-web.zip"

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

resource "aws_iam_role" "web_lambda" {
  count = var.enable_web_app ? 1 : 0

  name = "${local.name}-web-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy" "web_lambda" {
  count = var.enable_web_app ? 1 : 0

  name = "${local.name}-web-lambda-policy"
  role = aws_iam_role.web_lambda[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WriteLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.web_lambda[0].arn}:*"
      },
      {
        Sid    = "ReadLogGroup"
        Effect = "Allow"
        Action = [
          "logs:DescribeLogStreams"
        ]
        Resource = aws_cloudwatch_log_group.web_lambda[0].arn
      },
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
      },
      {
        Sid    = "CognitoEmailOtp"
        Effect = "Allow"
        Action = [
          "cognito-idp:InitiateAuth",
          "cognito-idp:RespondToAuthChallenge",
          "cognito-idp:ListUsers",
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup"
        ]
        Resource = aws_cognito_user_pool.main.arn
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "web_lambda" {
  count = var.enable_web_app ? 1 : 0

  name              = "/aws/lambda/${local.name}-web"
  retention_in_days = var.lambda_log_retention_days

  tags = local.tags
}

resource "aws_lambda_function" "web" {
  count = var.enable_web_app ? 1 : 0

  function_name    = "${local.name}-web"
  role             = aws_iam_role.web_lambda[0].arn
  filename         = local.web_lambda_zip_path
  source_code_hash = filebase64sha256(local.web_lambda_zip_path)
  handler          = "run.sh"
  runtime          = var.lambda_runtime
  architectures    = [var.lambda_architecture]
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout_seconds
  layers           = [local.lambda_web_adapter_layer_arn]

  environment {
    variables = {
      AUTH_MODE               = "cognito"
      AWS_LAMBDA_EXEC_WRAPPER = "/opt/bootstrap"
      AWS_LWA_PORT            = "8080"
      COGNITO_CLIENT_ID       = aws_cognito_user_pool_client.web.id
      COGNITO_USER_POOL_ID    = aws_cognito_user_pool.main.id
      DATABASE_URL            = var.database_url
      DIRECT_DATABASE_URL     = var.direct_database_url
      HOSTNAME                = "0.0.0.0"
      NODE_ENV                = "production"
      PORT                    = "8080"
      PROOFS_BUCKET_NAME      = aws_s3_bucket.proofs.bucket
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.web_lambda,
    aws_iam_role_policy.web_lambda
  ]

  tags = local.tags
}

resource "aws_lambda_function_url" "web" {
  count = var.enable_web_app ? 1 : 0

  function_name      = aws_lambda_function.web[0].function_name
  authorization_type = "NONE"
  invoke_mode        = "BUFFERED"
}

resource "aws_cloudfront_distribution" "web" {
  count = var.enable_web_app ? 1 : 0

  enabled         = true
  is_ipv6_enabled = true
  price_class     = var.cloudfront_price_class
  comment         = "CondoLedger Next.js web distribution"

  origin {
    origin_id = "web-lambda"
    domain_name = trimsuffix(
      trimprefix(aws_lambda_function_url.web[0].function_url, "https://"),
      "/"
    )

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id         = "web-lambda"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled[0].id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host_header[0].id
    compress                 = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = local.tags
}
