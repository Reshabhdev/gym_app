import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Fetch the database URL from the environment
# Default to a local PostgreSQL instance for the gym_ai application
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:postgres@localhost/gym_ai"
)

# Create the async engine
# echo=True will print all generated SQL queries to the console for debugging
engine = create_async_engine(DATABASE_URL, echo=True)

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
