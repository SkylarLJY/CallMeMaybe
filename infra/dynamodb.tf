# DynamoDB table for call metadata
resource "aws_dynamodb_table" "calls" {
  name         = "${var.project_name}-calls"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "callSid"

  attribute {
    name = "callSid"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.project_name}-calls"
  }
}
