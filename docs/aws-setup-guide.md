# AWS Setup Guide

This guide continues the portfolio AWS migration from the current state.

## Where We Are

Completed:

1. Portfolio code changes are done.
2. Code was pushed to GitHub.
3. AWS-ready project card, frontend event hooks, architecture notes, and GitHub Actions deploy workflow are in the repo.
4. Terraform infrastructure code has been added under `infra/terraform`.

Current phase:

3. Create AWS infrastructure.

Next phases:

4. Connect GitHub Actions to AWS using OIDC.
5. Add Lambda, SQS, SES, DynamoDB, and CloudWatch notification backend.
6. Add Bedrock assistant later as Phase 2.

## What This Terraform Creates

The first infrastructure phase creates:

- Private S3 bucket for static portfolio files.
- S3 public access block.
- S3 versioning and AES256 server-side encryption.
- CloudFront distribution.
- CloudFront Origin Access Control for private S3 access.
- Optional ACM certificate and Route 53 alias record.
- GitHub Actions IAM OIDC deploy role.
- AWS monthly budget alert.

It does not create the notification backend yet. That is a separate phase so the hosting stays simple and easy to verify first.

## Before You Start

Use the AWS account where your course/free-tier credits exist.

Install locally:

- Terraform: https://developer.hashicorp.com/terraform/install
- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

Or use AWS CloudShell:

1. Open AWS Console.
2. Search `CloudShell`.
3. Clone your GitHub repo there.
4. Run the Terraform commands from CloudShell.

CloudShell is often easier because it already has AWS credentials from your console session.

## Important Cost Guardrails

Do these before creating resources:

1. Open AWS Console.
2. Search `Billing and Cost Management`.
3. Open `Budgets`.
4. Create a monthly cost budget:
   - Budget name: `portfolio-safety-budget`
   - Amount: `$10`
   - Alert at 50%, 80%, and 100%
   - Email: `chetanawari2002@gmail.com`

The Terraform also includes a budget resource, but creating one manually first is a good safety net.

AWS documentation supports using Budgets for email/SNS cost notifications.

## Option A: First Deploy Without Custom Domain

Use this first. It is the safest path because you can test the AWS-hosted site using the CloudFront URL before touching DNS.

### 1. Configure AWS CLI

If working locally:

```powershell
aws configure
```

Use:

- Region: `ap-south-1`
- Output: `json`

If using CloudShell, you usually do not need `aws configure`.

### 2. Create Terraform Variables

From repo root:

```powershell
Copy-Item infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
```

Edit `infra/terraform/terraform.tfvars`:

```hcl
project_name = "chetan-portfolio"
environment  = "prod"
aws_region   = "ap-south-1"

domain_name       = ""
route53_zone_name = ""

github_owner = "mr-chetan-66"
github_repo  = "Portfolio"

create_github_oidc_provider = true

monthly_budget_limit_usd = 10
budget_alert_emails      = ["chetanawari2002@gmail.com"]
```

Keep `domain_name` empty for the first deploy.

### 3. Initialize Terraform

```powershell
cd infra/terraform
terraform init
```

### 4. Review The Plan

```powershell
terraform plan
```

Read the plan. You should see resources for S3, CloudFront, IAM, and Budget.

### 5. Apply

```powershell
terraform apply
```

Type `yes` only after reviewing the plan.

### 6. Save Outputs

After apply, Terraform prints:

- `s3_bucket_name`
- `cloudfront_distribution_id`
- `cloudfront_domain_name`
- `github_actions_role_arn`

Copy those values. You need them for GitHub.

## Connect GitHub Actions To AWS

Go to GitHub:

1. Open `mr-chetan-66/Portfolio`.
2. Go to `Settings`.
3. Open `Secrets and variables`.
4. Open `Actions`.
5. Choose `Variables`.
6. Add these repository variables:

```text
AWS_DEPLOY_ENABLED=true
AWS_ROLE_ARN=<github_actions_role_arn output>
AWS_REGION=ap-south-1
AWS_S3_BUCKET=<s3_bucket_name output>
AWS_CLOUDFRONT_DISTRIBUTION_ID=<cloudfront_distribution_id output>
```

Do not add AWS access keys. The workflow uses OIDC, so GitHub receives short-lived AWS credentials by assuming the IAM role.

AWS and GitHub both document OIDC as the recommended pattern for GitHub Actions because it avoids storing long-lived credentials.

## Trigger First AWS Deploy

After GitHub variables are set:

1. Open GitHub repo.
2. Go to `Actions`.
3. Select `Deploy portfolio to AWS`.
4. Click `Run workflow`.
5. Choose branch `main`.
6. Run.

Expected result:

- Workflow syncs files to S3.
- Workflow creates CloudFront invalidation.
- AWS site becomes available at `https://<cloudfront_domain_name>`.

CloudFront can take a few minutes after first creation.

## Option B: Add Custom Domain With Route 53

Do this after the CloudFront URL works.

You need a Route 53 public hosted zone for your domain.

Example:

- Domain: `chetanawari.com`
- AWS portfolio URL: `aws.chetanawari.com`

Edit `infra/terraform/terraform.tfvars`:

```hcl
domain_name       = "aws.chetanawari.com"
route53_zone_name = "chetanawari.com"
```

Then run:

```powershell
terraform plan
terraform apply
```

Terraform will create:

- ACM certificate in `us-east-1`, required for CloudFront custom domains.
- DNS validation records in Route 53.
- Route 53 alias record pointing the domain to CloudFront.

Wait for certificate validation and CloudFront deployment. This can take several minutes.

## What To Verify

Check these:

1. S3 bucket is private.
2. S3 Block Public Access is enabled.
3. CloudFront URL loads portfolio.
4. Direct S3 object access is not public.
5. GitHub Actions deploy succeeds.
6. Pushing to `main` updates both Vercel and AWS.
7. Budget alert exists.

## What Not To Do

- Do not make the S3 bucket public.
- Do not create EC2 for this static portfolio.
- Do not store AWS access keys in GitHub secrets.
- Do not enable Bedrock before basic hosting and notifications work.
- Do not email yourself on every page refresh.

## Next Phase After Hosting Works

Notification backend:

1. Lambda Function URL receives frontend events.
2. Lambda validates origin and payload.
3. Lambda sends event to SQS.
4. SQS triggers worker Lambda.
5. Worker uses DynamoDB TTL to dedupe repeated interactions.
6. Worker sends email using SES.
7. CloudWatch logs and alarms track failures.

Frontend is already prepared. After Lambda Function URL exists, update:

```html
<meta name="portfolio-event-endpoint" content="https://your-lambda-url.lambda-url.region.on.aws/" />
```

Then push to GitHub. Both Vercel and AWS will use the same event endpoint.

## Helpful Official References

- AWS S3 static website guide notes that CloudFront OAC can keep Block Public Access enabled.
- AWS CloudFront OAC documentation explains restricting S3 origin access through CloudFront.
- AWS security guidance recommends IAM roles and OIDC for GitHub Actions.
- AWS Budgets documentation covers email and SNS notifications for budget thresholds.
