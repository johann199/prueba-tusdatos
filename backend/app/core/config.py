from decouple import config
from typing import Optional

class Settings:
    DATABASE_URL: str = config("DATABASE_URL")
    
    SECRET_KEY: str = config("SECRET_KEY")
    ALGORITHM: str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)
    
    
    PROJECT_NAME: str = "Mis Eventos API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = config("ENVIRONMENT", default="development")
    DEBUG: bool = config("DEBUG", default=False, cast=bool)
    
    
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3000",
    ]

settings = Settings()