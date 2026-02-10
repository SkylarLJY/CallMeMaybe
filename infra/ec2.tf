# Get latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# SSH Key Pair
resource "aws_key_pair" "twilio_bridge" {
  key_name   = "${var.project_name}-twilio-bridge-key"
  public_key = var.ssh_public_key
}

# IAM Role for EC2
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for EC2 to access S3 and ECR
resource "aws_iam_role_policy" "ec2_policy" {
  name = "${var.project_name}-ec2-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.transcripts.arn,
          "${aws_s3_bucket.transcripts.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = aws_ecr_repository.twilio_bridge.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = aws_dynamodb_table.calls.arn
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# EC2 Instance
resource "aws_instance" "twilio_bridge" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.twilio_bridge.key_name
  vpc_security_group_ids = [aws_security_group.twilio_bridge.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = templatefile("${path.module}/user_data.sh", {
    caddyfile          = file("${path.module}/Caddyfile")
    docker_compose     = file("${path.module}/docker-compose.yml")
    aws_region         = var.aws_region
    ecr_url            = aws_ecr_repository.twilio_bridge.repository_url
    tailscale_auth_key = var.tailscale_auth_key
    env_file           = templatefile("${path.module}/.env.tpl", {
      aws_region        = var.aws_region
      s3_bucket         = aws_s3_bucket.transcripts.id
      dynamodb_table    = aws_dynamodb_table.calls.name
      bridge_image      = "${aws_ecr_repository.twilio_bridge.repository_url}:latest"
      twilio_auth_token = var.twilio_auth_token
    })
  })

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "${var.project_name}-twilio-bridge"
  }

  lifecycle {
    ignore_changes = [ami]
  }
}

# Elastic IP for stable public address
resource "aws_eip" "twilio_bridge" {
  instance = aws_instance.twilio_bridge.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-twilio-bridge-eip"
  }
}
