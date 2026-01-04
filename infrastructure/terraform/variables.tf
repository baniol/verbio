variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "verbio"
}

variable "lambda_memory" {
  description = "Lambda memory in MB"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "bedrock_model_id" {
  description = "Bedrock inference profile ID for validation"
  type        = string
  default     = "eu.amazon.nova-lite-v1:0"
}

variable "allowed_origins" {
  description = "CORS allowed origins"
  type        = list(string)
  default     = ["*"]
}

variable "domain_name" {
  description = "Root domain name (Route53 hosted zone)"
  type        = string
}

variable "api_subdomain" {
  description = "Subdomain for API endpoint"
  type        = string
}
