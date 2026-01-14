from fastapi import FastAPI

app = FastAPI(
    title="CallMeMaybe",
    description="AI voice assistant for screening recruiter calls",
    version="0.1.0",
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
