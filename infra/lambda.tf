# Lambda function for email notifications
# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-email-notifier-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Lambda basic execution policy (CloudWatch Logs)
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda policy for S3 and SES
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.transcripts.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda function code (from apps/transcript-notifier directory)
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../apps/transcript-notifier"
  output_path = "${path.module}/.terraform/transcript_notifier.zip"
}

# Lambda function
resource "aws_lambda_function" "email_notifier" {
  function_name    = "${var.project_name}-email-notifier"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.lambda_handler"
  runtime          = "python3.12"
  timeout          = 30
  memory_size      = 128
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      NOTIFICATION_EMAIL = var.notification_email
      SENDER_EMAIL       = var.sender_email
    }
  }

  tags = {
    Name = "${var.project_name}-email-notifier"
  }
}

# Permission for S3 to invoke Lambda
resource "aws_lambda_permission" "s3_invoke" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.email_notifier.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.transcripts.arn
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.email_notifier.function_name}"
  retention_in_days = 14
}
