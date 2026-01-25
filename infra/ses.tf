# SES Email Identity for sending notifications
# Note: You must verify this email address by clicking the link in the verification email

resource "aws_ses_email_identity" "sender" {
  email = var.sender_email
}

# Optional: If notification email is different from sender, verify it too
resource "aws_ses_email_identity" "notification" {
  count = var.notification_email != var.sender_email ? 1 : 0
  email = var.notification_email
}
