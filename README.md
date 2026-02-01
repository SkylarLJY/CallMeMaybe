# CallMeMaybe

> AI voice assistant for screening recruiter calls

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

CallMeMaybe is an AI-powered voice assistant that screens incoming recruiter calls. When someone calls your Twilio number, the AI answers, has a natural conversation, and emails you a transcript so you can decide whether to follow up.

## How It Works

1. Caller dials your Twilio phone number
2. AI assistant answers and conducts a screening conversation
3. Transcript is saved and emailed to you
4. You review and decide whether to call back

## Getting Started

### Prerequisites

- Twilio account with a phone number
- OpenAI API key
- AWS account

### Deployment

1. Deploy infrastructure to AWS:
   ```bash
   cd infra
   terraform init
   terraform apply
   ```

2. Configure Twilio webhook to point to your EC2 endpoint

3. Set environment variables on EC2

### Server Access

The EC2 server is accessed via **Tailscale** (no public SSH):

```bash
ssh ec2-user@<tailscale-ip>
```

To set up Tailscale on a new server:
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo systemctl enable --now tailscaled
sudo tailscale up
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
