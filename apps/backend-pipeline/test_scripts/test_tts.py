import asyncio
import time
from services.tts import ElevenLabsTTS


async def test():
    print("🔊 Testing Text-to-Speech...\n")

    text = "Hello what brought you here?"
    tts = ElevenLabsTTS()

    start = time.time()
    audio = tts.generate_audio(text)
    latency = (time.time() - start) * 1000

    # Save to file
    with open("output.mp3", "wb") as f:
        f.write(audio)

    print(f"✅ Success!")
    print(f"💾 Saved to: output.mp3 ({len(audio)} bytes)")
    print(f"⚡ Latency: {latency:.0f}ms")
    print(f"\n▶️  Play with: afplay output.mp3")

if __name__ == "__main__":
    asyncio.run(test())
