from pathlib import Path

from deepgram import DeepgramClient

from config.settings import settings


class DeepgramSTT:

    def __init__(self) -> None:
        self.client = DeepgramClient(api_key=settings.deepgram_api_key)

    async def transcribe_url(self, url: str) -> dict:
        try:
            response = self.client.listen.v1.media.transcribe_url(
                url=url,
                model="nova-3",
                smart_format=True,
            )

            # Extract results
            transcript = response.results.channels[0].alternatives[0].transcript
            confidence = response.results.channels[0].alternatives[0].confidence

            return {
                "text": transcript,
                "confidence": confidence,
                "success": True,
                "error": None,
            }

        except Exception as e:
            return {
                "text": "",
                "confidence": 0,
                "success": False,
                "error": str(e),
            }
