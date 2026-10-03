"""Wealth AI - Proactive Alerts Router"""
from fastapi import APIRouter
from typing import List
from app.schemas import ProactiveAlert
from app.database import db

router = APIRouter(prefix="/alerts", tags=["Proactive Alerts"])

@router.get("", response_model=List[ProactiveAlert])
def get_alerts():
    return db.get_alerts()

@router.post("/{alert_id}/dismiss")
def dismiss_alert(alert_id: str):
    db.dismiss_alert(alert_id)
    return {"success": True, "alert_id": alert_id}
