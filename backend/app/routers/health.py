"""Wealth AI - Financial Health Router"""
from fastapi import APIRouter
from app.schemas import FinancialHealthScore
from app.database import db
from app.ml.health_engine import health_engine

router = APIRouter(prefix="/health", tags=["Financial Health"])

@router.get("", response_model=FinancialHealthScore)
def get_financial_health():
    txs = db.get_all_transactions()
    return health_engine.calculate_health(txs)
