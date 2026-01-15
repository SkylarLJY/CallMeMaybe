from elevenlabs.client import ElevenLabs
from config.settings import settings


class ElevenLabsTTS:
    def __init__(self):
        self.client = ElevenLabs(api_key=settings.elevenlabs_api_key)

    def generate_audio(self, text: str) -> bytes:
        try:
            response = self.client.text_to_speech.convert(
                text=text,
                voice_id="sB1b5zUrxQVAFl2PhZFp",
            )
            audio_bytes = b"".join(response)
            return audio_bytes
        except Exception as e:
            raise Exception(f"TTS generation failed: {e}")
