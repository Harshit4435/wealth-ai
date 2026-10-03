"""Wealth AI - Autonomous Personal Financial Intelligence & Copilot
FastAPI Backend Application Entrypoint
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import transactions, analytics, health, forecast, copilot, alerts, profile

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Autonomous Personal Financial Intelligence Engine with ML Categorization, Spending Forecasting & AI Copilot",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(transactions.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(forecast.router, prefix=settings.API_PREFIX)
app.include_router(copilot.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(profile.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "endpoints": {
            "docs": "/docs",
            "transactions": f"{settings.API_PREFIX}/transactions",
            "analytics": f"{settings.API_PREFIX}/analytics/summary",
            "health": f"{settings.API_PREFIX}/health",
            "forecast": f"{settings.API_PREFIX}/forecast",
            "copilot": f"{settings.API_PREFIX}/copilot/query",
            "alerts": f"{settings.API_PREFIX}/alerts"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
