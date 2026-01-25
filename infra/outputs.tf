output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance (Elastic IP)"
  value       = aws_eip.twilio_bridge.public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.twilio_bridge.id
}

output "s3_bucket_name" {
  description = "S3 bucket name for transcripts"
  value       = aws_s3_bucket.transcripts.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.transcripts.arn
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.email_notifier.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.email_notifier.arn
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i <your-key.pem> ec2-user@${aws_eip.twilio_bridge.public_ip}"
}

output "dns_instructions" {
  description = "DNS configuration instructions"
  value       = "Point your domain '${var.domain_name}' A record to ${aws_eip.twilio_bridge.public_ip}"
}
