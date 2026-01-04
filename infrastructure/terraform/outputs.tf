output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = "${aws_apigatewayv2_api.api.api_endpoint}/validate"
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.validate.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.validate.arn
}

output "api_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.api.id
}

output "api_custom_domain" {
  description = "Custom domain API endpoint"
  value       = "https://${var.api_subdomain}.${var.domain_name}/validate"
}

output "test_command" {
  description = "Command to test the API"
  value       = <<-EOT
    curl -X POST https://${var.api_subdomain}.${var.domain_name}/validate \
      -H 'Content-Type: application/json' \
      -d '{"user_answer":"guten tag","expected":"Guten Tag","prompt":"Dzień dobry","language":"de"}'
  EOT
}
