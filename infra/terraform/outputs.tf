output "proofs_bucket_name" {
  value = aws_s3_bucket.proofs.bucket
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.web.id
}

output "web_cloudfront_domain_name" {
  value = var.enable_web_app ? aws_cloudfront_distribution.web[0].domain_name : null
}

output "web_cloudfront_url" {
  value = var.enable_web_app ? "https://${aws_cloudfront_distribution.web[0].domain_name}" : null
}

output "web_lambda_function_name" {
  value = var.enable_web_app ? aws_lambda_function.web[0].function_name : null
}
