"""
Simple API connectivity tests for CallMeMaybe.
Run with: python test_apis.py
"""

import asyncio
import os
import sys

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def mask_key(key: str) -> str:
    """Show first 10 chars of API key for verification."""
    if not key:
        return "(not set)"
    return key[:10] + "..." if len(key) > 10 else key


async def test_openai() -> bool:
    """Test OpenAI API with a simple completion request."""
    print("\n[1/3] Testing OpenAI...")

    api_key = os.getenv("OPENAI_API_KEY")
    print(f"      API Key: {mask_key(api_key)}")

    if not api_key:
        print("      ✗ OPENAI_API_KEY not set in .env")
        return False

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        response = client.responses.create(
            model="gpt-5.2",
            input="Write a short bedtime story about a unicorn."
        )
        reply = response.output_text
        print(f"      Response: {reply}")
        print("      ✓ OpenAI working!")
        return True
    except Exception as e:
        print(f"      ✗ OpenAI error: {e}")
        return False


async def test_deepgram() -> bool:
    """Test Deepgram API by checking key validity."""
    print("\n[2/3] Testing Deepgram...")

    api_key = os.getenv("DEEPGRAM_API_KEY")
    print(f"      API Key: {mask_key(api_key)}")

    if not api_key:
        print("      ✗ DEEPGRAM_API_KEY not set in .env")
        return False

    try:
        from deepgram import DeepgramClient

        # Deepgram SDK v3 reads DEEPGRAM_API_KEY from env automatically
        client = DeepgramClient()
        # Get projects to verify the API key works
        response = client.manage.v1.projects.list()
        print(f"      Found {len(response.projects)} project(s)")
        print("      ✓ Deepgram working!")
        return True
    except Exception as e:
        print(f"      ✗ Deepgram error: {e}")
        return False


async def test_elevenlabs() -> bool:
    """Test ElevenLabs API by generating a short audio sample."""
    print("\n[3/3] Testing ElevenLabs...")

    api_key = os.getenv("ELEVENLABS_API_KEY")
    print(f"      API Key: {mask_key(api_key)}")

    if not api_key:
        print("      ✗ ELEVENLABS_API_KEY not set in .env")
        return False

    try:
        from elevenlabs import ElevenLabs

        client = ElevenLabs(api_key=api_key)
        # Generate a tiny audio sample (not saved, just verifying it works)
        audio = client.text_to_speech.convert(
            text="Hello",
            voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel voice (default)
            model_id="eleven_monolingual_v1",
        )
        # Consume the generator to verify it works
        audio_bytes = b"".join(audio)
        print(f"      Generated {len(audio_bytes)} bytes of audio")
        print("      ✓ ElevenLabs working!")
        return True
    except Exception as e:
        print(f"      ✗ ElevenLabs error: {e}")
        return False


async def main():
    print("=" * 50)
    print("CallMeMaybe API Connectivity Test")
    print("=" * 50)

    results = await asyncio.gather(
        test_openai(),
        test_deepgram(),
        test_elevenlabs(),
    )

    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)

    services = ["OpenAI", "Deepgram", "ElevenLabs"]
    all_passed = True
    for service, passed in zip(services, results):
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"  {service}: {status}")
        if not passed:
            all_passed = False

    print("=" * 50)

    if all_passed:
        print("\nAll APIs working! Ready to build.")
        sys.exit(0)
    else:
        print("\nSome APIs failed. Check the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
