"""
Application Configuration Management using Pydantic.
"""
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Manages application settings loaded from environment variables."""
    # Example: ALLOWED_ORIGINS="http://localhost:3000,https://my-prod-frontend.com"
    ALLOWED_ORIGINS: str = "*"

    class Config:
        env_file = ".env"

settings = Settings()