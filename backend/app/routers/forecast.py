"""Wealth AI - Spending Forecast Router"""
from fastapi import APIRouter
from app.schemas import SpendingForecast
from app.database import db
from app.ml.forecaster import forecaster

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("", response_model=SpendingForecast)
def get_spending_forecast():
    txs = db.get_all_transactions()
    return forecaster.compute_forecast(txs)
