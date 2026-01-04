# LLM Validation Backend

AWS Lambda + API Gateway backend for intelligent answer validation using Amazon Bedrock (Nova Lite).

## Architecture

```
Frontend → API Gateway (HTTP) → Lambda → Bedrock (Nova Lite)
```

## Prerequisites

1. **Terraform** installed (v1.0+)

2. **AWS credentials** configured:
   ```bash
   # Option A: Environment variables
   export AWS_ACCESS_KEY_ID=xxx
   export AWS_SECRET_ACCESS_KEY=xxx
   
   # Option B: AWS profile (same as generate_audio.py)
   export AWS_PROFILE=your-profile
   ```

3. **Bedrock access** enabled in eu-central-1:
   - AWS Console → Bedrock → Model access
   - Request access to "Amazon Nova Lite"

## Deployment

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy
terraform apply

# Get API endpoint
terraform output api_endpoint
```

## Update Lambda Code

After modifying `lambda/validate_answer.py`:

```bash
cd infrastructure/terraform
terraform apply
```

## API

**Endpoint:** `POST /validate`

**Request:**
```json
{
  "user_answer": "wo ist die Straße",
  "expected": "Wo ist diese Straße?",
  "prompt": "Gdzie jest ta ulica?",
  "language": "de",
  "vocabulary": [
    {"word": "Straße", "type": "noun"},
    {"word": "diese", "type": "pronoun"}
  ]
}
```

**Response:**
```json
{
  "correct": true,
  "grammar_ok": true,
  "meaning_preserved": true,
  "key_vocabulary_present": ["Straße"],
  "key_vocabulary_missing": ["diese"],
  "errors": [],
  "minor_issues": ["'die' zamiast 'diese'"],
  "confidence": 0.85
}
```

## Local Testing

Test Lambda locally before deploying:

```bash
cd infrastructure/lambda
python test_local.py
```

## Testing Deployed API

```bash
# Get test command from Terraform
terraform output test_command

# Or manually:
curl -X POST https://xxx.execute-api.eu-central-1.amazonaws.com/validate \
  -H 'Content-Type: application/json' \
  -d '{"user_answer":"guten tag","expected":"Guten Tag","prompt":"Dzień dobry","language":"de"}'
```

## Costs

Nova Lite pricing (eu-central-1):
- Input: ~$0.06 / 1M tokens
- Output: ~$0.24 / 1M tokens

| Usage | Phrases/day | Cost/month |
|-------|-------------|------------|
| Light | 50 | ~$0.01 |
| Medium | 200 | ~$0.05 |
| Heavy | 500 | ~$0.10 |

## Files

```
infrastructure/
├── lambda/
│   ├── validate_answer.py   # Lambda handler
│   └── test_local.py        # Local test script
├── terraform/
│   ├── main.tf              # Main configuration
│   ├── variables.tf         # Input variables
│   ├── outputs.tf           # Output values
│   └── .gitignore           # Ignore state files
└── README.md
```

## Cleanup

```bash
cd infrastructure/terraform
terraform destroy
```
