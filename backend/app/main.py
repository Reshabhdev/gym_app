from fastapi import FastAPI
from app.api.routes import router as api_router
from app.db.database import engine, Base
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (Simple approach without Alembic)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"FAILED TO CONNECT TO DATABASE ON STARTUP: {e}")
        # Note: If database is absolutely required to start, we could raise e here.
        # But letting it pass allows the health check to succeed and give better error visibility.
    yield
    # Cleanup on shutdown
    await engine.dispose()

from fastapi.middleware.cors import CORSMiddleware

# Initialize the main FastAPI application
app = FastAPI(
    title="Gym AI Industry API", 
    description="An end-to-end ML backend for personalized fitness recommendations.",
    version="1.0",
    lifespan=lifespan
)

# Add CORS so React frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to localhost:3000 or specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the endpoints from our routes file
app.include_router(api_router, prefix="/api/v1")

# A simple health check endpoint for the root URL
@app.get("/")
async def health_check():
    return {
        "status": "Online",
        "service": "Gym AI Engine",
        "docs_url": "/docs"
    }