# Terraform - LLM Validation Backend

Infrastructure as code for the LLM validation API (Lambda + API Gateway + Route53).

## Prerequisites

1. Terraform >= 1.0
2. AWS CLI profile configured
3. Route53 hosted zone for your domain
4. Bedrock access enabled for Amazon Nova Lite in eu-central-1

## Setup

```bash
# 1. Copy example files
cp terraform.tfvars.example terraform.tfvars
cp backend.hcl.example backend.hcl

# 2. Edit with your values
vim terraform.tfvars
vim backend.hcl

# 3. Create S3 backend (first time only)
./bootstrap.sh

# 4. Initialize Terraform
terraform init -backend-config=backend.hcl
```

## Usage

```bash
terraform plan
terraform apply
```

## Variables

| Name | Description | Default |
|------|-------------|---------|
| `aws_profile` | AWS CLI profile | required |
| `aws_region` | AWS region | `eu-central-1` |
| `domain_name` | Root domain (Route53 zone) | required |
| `api_subdomain` | API subdomain | required |


## Outputs

- `api_endpoint` - API Gateway default endpoint
- `api_custom_domain` - Custom domain endpoint
- `test_command` - curl command to test the API

## Cleanup

```bash
terraform destroy
```

## Files

```
terraform/
├── main.tf                  # Main infrastructure
├── variables.tf             # Variable definitions
├── outputs.tf               # Output values
├── terraform.tfvars         # Your values (gitignored)
├── terraform.tfvars.example # Example values
├── backend.hcl              # Backend config (gitignored)
├── backend.hcl.example      # Example backend config
├── bootstrap.sh             # Creates S3 backend
└── .gitignore
```
