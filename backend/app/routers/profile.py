"""Wealth AI - User Profile & Customized Savings Plan Router
Asks and stores the user's monthly income, rent, recurring obligations, and target savings goal,
and computes a personalized budget blueprint and milestone savings growth trajectory.
"""
from fastapi import APIRouter
from app.schemas import UserProfile, SavingsPlan
from app.database import db

router = APIRouter(prefix="/profile", tags=["User Profile & Financial Plan"])

@router.get("", response_model=UserProfile)
def get_profile():
    return db.get_user_profile()

@router.post("", response_model=SavingsPlan)
def update_profile_and_get_plan(profile_in: UserProfile):
    """Updates user income, rent, bills, and savings target, then recalculates the plan."""
    db.update_user_profile(profile_in.dict())
    plan = db.generate_savings_plan()
    return plan

@router.get("/plan", response_model=SavingsPlan)
def get_savings_plan():
    """Fetches the calculated budget blueprint and projected timeline chart data."""
    return db.generate_savings_plan()
