from typing import Dict, List
from openai import AsyncOpenAI
from config.settings import settings


class GPTLLM:
    def __init__(self, profile: dict):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.profile = profile
        self.conversation_history: List[Dict[str, str]] = []

    def _build_prompt(self) -> str:
        return f"""You are an AI assistant answering calls on behalf of {self.profile['name']}.
Your role:
1. Gather information from the caller (who they are, why they're calling, what they need)
2. Answer questions about {self.profile['name']} when appropriate
3. Be professional, friendly, and helpful

Guidelines:
- Start with a brief, friendly greeting, and clarify you're an AI tool at the beginning of the conversation
- Keep responses concise (under 50 words)
- Don't repeat unless asked to
- If you don't know something, say so
- Take note of key information shared by the caller
- sound like a real person having a natural conversation.
- If the caller has information that requires the receiver's attention, acknowledge it and let them know the receiver will be notified. 
- Collect key details: caller's name, phone number, and brief message if they need a call back
- Check if there's any further action requred 
        
"""

    async def respond(self, input: str) -> str:
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": input
        })
        response = await self.client.responses.create(
            model="gpt-4-turbo",
            input=self.conversation_history,
            instructions=self._build_prompt()
        )
        self.conversation_history.append({
            "role": "assistant",
            "content": response.output_text
        })
        return response.output_text
    
    async def summarize(self) -> str:
        pass
