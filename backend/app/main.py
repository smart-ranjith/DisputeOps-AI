from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api.routes import router
from app.seed_data import seed_database
import os

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Agentic AI for Intelligent Payment Dispute Investigation and Financial Loss Prevention"
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database and seed on startup if not present
@app.on_event("startup")
def on_startup():
    init_db()
    if not os.path.exists(settings.DATABASE_PATH) or os.path.getsize(settings.DATABASE_PATH) < 1000:
        seed_database()

app.include_router(router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "ONLINE",
        "paypal_mode": settings.PAYPAL_ENV,
        "endpoints": {
            "disputes": f"{settings.API_PREFIX}/disputes",
            "stats": f"{settings.API_PREFIX}/stats",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
