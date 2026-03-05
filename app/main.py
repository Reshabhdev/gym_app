from fastapi import FastAPI
from app.api.routes import router as api_router

# Initialize the main FastAPI application
app = FastAPI(
    title="Gym AI Industry API", 
    description="An end-to-end ML backend for personalized fitness recommendations.",
    version="1.0"
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