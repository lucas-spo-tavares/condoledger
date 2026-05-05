output "proofs_bucket_name" {
  value = aws_s3_bucket.proofs.bucket
}

output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}

output "frontend_cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "frontend_cloudfront_domain_name" {
  value = aws_cloudfront_distribution.frontend.domain_name
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.web.id
}

output "backend_lambda_name" {
  value = aws_lambda_function.backend.function_name
}

output "backend_api_url" {
  value = aws_apigatewayv2_stage.backend_default.invoke_url
}
