output "dynamodb_table_name" {
  value = aws_dynamodb_table.app.name
}

output "proofs_bucket_name" {
  value = aws_s3_bucket.proofs.bucket
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.web.id
}
