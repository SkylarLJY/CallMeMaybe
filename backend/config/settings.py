from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    openai_api_key: str = ""
    deepgram_api_key: str = ""
    elevenlabs_api_key: str = ""
    database_url: str = "sqlite:///./callmemaybe.db"
    enable_phone_support: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
