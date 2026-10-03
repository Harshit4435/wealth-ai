"""Wealth AI - App Configuration"""
import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "Wealth AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    ENV: str = os.getenv("ENV", "development")
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*"
    ]
    DATA_DIR: str = os.path.join(os.path.dirname(__file__), "..", "data")

settings = Settings()
