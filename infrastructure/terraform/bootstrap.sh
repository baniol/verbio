#!/bin/bash
#
# Bootstrap Terraform S3 backend
# Creates S3 bucket and DynamoDB table for state locking
#
# Usage:
#   ./bootstrap.sh
#
# Reads configuration from backend.hcl

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_FILE="$SCRIPT_DIR/backend.hcl"

if [ ! -f "$BACKEND_FILE" ]; then
    echo "Error: backend.hcl not found. Copy from backend.hcl.example"
    exit 1
fi

# Parse backend.hcl
get_var() {
    grep "^$1" "$BACKEND_FILE" | sed 's/.*= *"\(.*\)"/\1/'
}

BUCKET=$(get_var bucket)
REGION=$(get_var region)
PROFILE=$(get_var profile)
DYNAMO_TABLE=$(get_var dynamodb_table)

if [ -z "$BUCKET" ] || [ -z "$REGION" ] || [ -z "$PROFILE" ]; then
    echo "Error: bucket, region, and profile must be set in backend.hcl"
    exit 1
fi

DYNAMO_TABLE="${DYNAMO_TABLE:-${BUCKET}-lock}"

echo "Creating Terraform backend resources..."
echo "  Bucket: $BUCKET"
echo "  Region: $REGION"
echo "  DynamoDB Table: $DYNAMO_TABLE"
echo "  Profile: $PROFILE"
echo ""

# Create S3 bucket
echo "==> Creating S3 bucket..."
if aws s3api head-bucket --bucket "$BUCKET" --profile "$PROFILE" 2>/dev/null; then
    echo "    Bucket already exists"
else
    aws s3api create-bucket \
        --bucket "$BUCKET" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION" \
        --profile "$PROFILE"
    echo "    Created"
fi

# Enable versioning
echo "==> Enabling versioning..."
aws s3api put-bucket-versioning \
    --bucket "$BUCKET" \
    --versioning-configuration Status=Enabled \
    --profile "$PROFILE"
echo "    Done"

# Block public access
echo "==> Blocking public access..."
aws s3api put-public-access-block \
    --bucket "$BUCKET" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --profile "$PROFILE"
echo "    Done"

# Enable encryption
echo "==> Enabling encryption..."
aws s3api put-bucket-encryption \
    --bucket "$BUCKET" \
    --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}' \
    --profile "$PROFILE"
echo "    Done"

# Create DynamoDB table for locking
echo "==> Creating DynamoDB table for state locking..."
if aws dynamodb describe-table --table-name "$DYNAMO_TABLE" --region "$REGION" --profile "$PROFILE" 2>/dev/null; then
    echo "    Table already exists"
else
    aws dynamodb create-table \
        --table-name "$DYNAMO_TABLE" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION" \
        --profile "$PROFILE"
    echo "    Created"
fi

echo ""
echo "============================================"
echo "Bootstrap complete!"
echo "============================================"
echo ""
echo "Now run:"
echo "  terraform init -backend-config=backend.hcl"
echo ""
