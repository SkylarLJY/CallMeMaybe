# S3 Bucket for transcripts and call metadata
resource "aws_s3_bucket" "transcripts" {
  bucket_prefix = "${var.project_name}-transcripts-"

  tags = {
    Name = "${var.project_name}-transcripts"
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "transcripts" {
  bucket = aws_s3_bucket.transcripts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning
resource "aws_s3_bucket_versioning" "transcripts" {
  bucket = aws_s3_bucket.transcripts.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "transcripts" {
  bucket = aws_s3_bucket.transcripts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Lifecycle policy
resource "aws_s3_bucket_lifecycle_configuration" "transcripts" {
  bucket = aws_s3_bucket.transcripts.id

  rule {
    id     = "transcript-lifecycle"
    status = "Enabled"

    filter {
      prefix = "transcripts/"
    }

    transition {
      days          = var.transcript_ia_transition_days
      storage_class = "STANDARD_IA"
    }

    expiration {
      days = var.transcript_retention_days
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# S3 event notification to Lambda
resource "aws_s3_bucket_notification" "transcript_notification" {
  bucket = aws_s3_bucket.transcripts.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.email_notifier.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "transcripts/"
  }

  depends_on = [aws_lambda_permission.s3_invoke]
}
