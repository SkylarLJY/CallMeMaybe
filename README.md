# CallMeMaybe

> AI voice assistant for screening recruiter calls

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Work in Progress** - This project is under active development.

## Overview

CallMeMaybe is an AI-powered voice assistant that helps screen and manage incoming recruiter calls. It uses speech-to-text, large language models, and text-to-speech to have natural conversations and filter calls based on your preferences.

## Tech Stack

- **Backend**: Python / FastAPI
- **Frontend**: Next.js (coming soon)
- **Speech-to-Text**: Deepgram
- **LLM**: OpenAI
- **Text-to-Speech**: ElevenLabs

## Project Structure

```
callmemaybe/
├── backend/      # FastAPI backend service
├── frontend/     # Next.js frontend (coming soon)
├── docs/         # Documentation
└── scripts/      # Utility scripts
```

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend, coming soon)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn main:app --reload
```

### Configuration

Copy `backend/.env.example` to `backend/.env` and fill in your API keys:

- `OPENAI_API_KEY` - For LLM-powered conversations
- `DEEPGRAM_API_KEY` - For speech-to-text
- `ELEVENLABS_API_KEY` - For text-to-speech

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
