import asyncio
import time
from services.llm import GPTLLM
from config.profiles import DEMO_PROFILE


async def test():
    print("Type your messages below. Type 'quit' to end.")
    print("━" * 50)

    llm = GPTLLM(DEMO_PROFILE)

    while True:
        try:
            user_input = input("\nYou: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['quit', 'exit', 'q']:
                break

            # Get response
            start = time.time()
            response = await llm.respond(user_input)
            latency = time.time() - start

            print(f"\nBot: {response}")
            print(f"⚡ {latency:.1f}s")

        except KeyboardInterrupt:
            print("\n\nEnding conversation...")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            continue

if __name__ == "__main__":
    asyncio.run(test())
