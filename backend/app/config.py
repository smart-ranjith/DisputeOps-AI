import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "DisputeOps AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_PATH: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "disputeops.db")
    
    # PayPal Integration Config
    PAYPAL_CLIENT_ID: str = os.getenv("PAYPAL_CLIENT_ID", "")
    PAYPAL_CLIENT_SECRET: str = os.getenv("PAYPAL_CLIENT_SECRET", "")
    PAYPAL_SECRET: str = os.getenv("PAYPAL_SECRET", os.getenv("PAYPAL_CLIENT_SECRET", ""))
    PAYPAL_ENV: str = os.getenv("PAYPAL_ENV", "sandbox")  # "sandbox", "live", "mock"
    PAYPAL_SANDBOX_URL: str = "https://api-m.sandbox.paypal.com"
    PAYPAL_LIVE_URL: str = "https://api-m.paypal.com"
    
    # AI Engine Config
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
