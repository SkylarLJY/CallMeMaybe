"""Test script for the Deepgram STT service."""

import asyncio
import time

from services.stt import DeepgramSTT


async def test_transcription():
    """Test transcribing an audio file."""
    print("=" * 50)
    print("Testing Deepgram STT Service")
    print("=" * 50)

    # Initialize STT service
    stt = DeepgramSTT()

    # Test file path
    audio_file = "test_audio.wav"
    print(f"\n📁 Audio file: {audio_file}")

    # Measure transcription time
    start_time = time.time()
    result = stt.transcribe_url("https://dpgr.am/spacewalk.wav")

    # Handle both sync and async results
    if asyncio.iscoroutine(result):
        result = await result

    latency = time.time() - start_time

    # Print results
    print("\n" + "-" * 50)

    if result["success"]:
        print("✅ Transcription successful!")
        print(f"\n📝 Transcript: {result['text']}")
        print(f"🎯 Confidence: {result['confidence']:.2%}")
        print(f"⏱️  Latency: {latency:.2f}s")
    else:
        print("❌ Transcription failed!")
        print(f"⚠️  Error: {result['error']}")

    print("-" * 50)
    return result["success"]


if __name__ == "__main__":
    success = asyncio.run(test_transcription())
    exit(0 if success else 1)
