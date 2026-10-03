"""Wealth AI - AI Copilot Router
Follows strict deterministic tool-calling pattern:
User query -> Tool computation -> Structured financial guidance.
"""
from fastapi import APIRouter
from app.schemas import CopilotQuery, CopilotResponse
from app.database import db
from app.ml.copilot_engine import copilot_engine

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

@router.post("/query", response_model=CopilotResponse)
def query_copilot(payload: CopilotQuery):
    txs = db.get_all_transactions()
    result = copilot_engine.answer(payload.query, txs)
    return result
