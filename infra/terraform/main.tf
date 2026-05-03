provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

locals {
  name = "${var.project_name}-${var.environment}"

  tags = {
    Project     = "CondoLedger"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_dynamodb_table" "app" {
  name         = local.name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = local.tags
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

resource "aws_s3_bucket" "frontend" {
  bucket_prefix = "${local.name}-frontend-"
  force_destroy = var.enable_bucket_force_destroy

  tags = local.tags
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.name}-frontend-oac"
  description                       = "OAC for CondoLedger frontend static bucket."
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  comment             = "${local.name} static frontend"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "frontend-s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "frontend-s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  tags = local.tags
}

data "aws_iam_policy_document" "frontend_bucket_policy" {
  statement {
    sid = "AllowCloudFrontRead"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]
    resources = [
      "${aws_s3_bucket.frontend.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_bucket_policy.json
}

resource "aws_cognito_user_pool" "main" {
  name                     = local.name
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  deletion_protection      = var.cognito_deletion_protection

  sign_in_policy {
    allowed_first_auth_factors = ["EMAIL_OTP"]
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

data "archive_file" "backend_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambda/api-handler.mjs"
  output_path = "${path.module}/../lambda/api-handler.zip"
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "backend_lambda" {
  name               = "${local.name}-backend-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  tags               = local.tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.backend_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "backend_lambda_access" {
  statement {
    sid    = "DynamoDbAccess"
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan"
    ]
    resources = [
      aws_dynamodb_table.app.arn,
      "${aws_dynamodb_table.app.arn}/index/*"
    ]
  }

  statement {
    sid    = "ProofsBucketAccess"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]
    resources = ["${aws_s3_bucket.proofs.arn}/*"]
  }
}

resource "aws_iam_policy" "backend_lambda_access" {
  name   = "${local.name}-backend-lambda-access"
  policy = data.aws_iam_policy_document.backend_lambda_access.json
}

resource "aws_iam_role_policy_attachment" "backend_lambda_access" {
  role       = aws_iam_role.backend_lambda.name
  policy_arn = aws_iam_policy.backend_lambda_access.arn
}

resource "aws_lambda_function" "backend" {
  function_name    = "${local.name}-backend"
  role             = aws_iam_role.backend_lambda.arn
  handler          = "api-handler.handler"
  runtime          = var.lambda_runtime
  filename         = data.archive_file.backend_lambda_zip.output_path
  source_code_hash = data.archive_file.backend_lambda_zip.output_base64sha256
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout_seconds

  environment {
    variables = {
      NODE_ENV           = "production"
      APP_ENV            = var.environment
      DYNAMODB_TABLE     = aws_dynamodb_table.app.name
      PROOFS_BUCKET_NAME = aws_s3_bucket.proofs.bucket
      COGNITO_USER_POOL  = aws_cognito_user_pool.main.id
      AWS_REGION         = var.aws_region
    }
  }

  tags = local.tags
}

resource "aws_apigatewayv2_api" "backend" {
  name          = "${local.name}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["authorization", "content-type", "x-requested-with"]
    allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_origins     = var.frontend_allowed_origins
    max_age           = 3600
  }

  tags = local.tags
}

resource "aws_apigatewayv2_integration" "backend_lambda" {
  api_id                 = aws_apigatewayv2_api.backend.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.backend.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "backend_default" {
  api_id    = aws_apigatewayv2_api.backend.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.backend_lambda.id}"
}

resource "aws_apigatewayv2_stage" "backend_default" {
  api_id      = aws_apigatewayv2_api.backend.id
  name        = "$default"
  auto_deploy = true

  tags = local.tags
}

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backend.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.backend.execution_arn}/*/*"
}
