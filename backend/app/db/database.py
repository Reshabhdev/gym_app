import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Fetch the database URL from the environment
# Default to a local PostgreSQL instance for the gym_ai application
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://rishabhdevsingh@localhost/gym_ai"
)

# Render uses `postgres://` for its internal URLs, but SQLAlchemy async requires `postgresql+asyncpg://`
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Enforce SSL/TLS for remote databases (like Render, Neon, Supabase)
if "localhost" not in DATABASE_URL and "127.0.0.1" not in DATABASE_URL:
    if "?" not in DATABASE_URL:
        DATABASE_URL += "?ssl=require"
    elif "ssl=" not in DATABASE_URL:
        DATABASE_URL += "&ssl=require"

try:
    engine = create_async_engine(DATABASE_URL, echo=True)
except Exception as e:
    print(f"CRITICAL ERROR: Failed to create async engine: {e}")
    raise

# Create an async session maker to instantiate sessions per request
async_session = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Base class for our SQLAlchemy models
Base = declarative_base()

# Dependency to get the database session in FastAPI routes
async def get_db():
    async with async_session() as session:
        yield session
