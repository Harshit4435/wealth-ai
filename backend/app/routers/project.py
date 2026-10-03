"""Wealth AI - Project Planner & Dynamic Daily Overspend Router
Provides endpoints to create a project from scratch and update it in-place
when daily expenses exceed the calculated allowance.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.database import db
from app.schemas import ProjectPlan, ProjectPlanCreate, DailyExpenseEntry

router = APIRouter(prefix="/project", tags=["Project Planner"])

@router.get("", response_model=ProjectPlan)
def get_current_project():
    """Retrieve the current active project plan and daily expense allowance allocations."""
    return db.get_project_plan()

@router.post("", response_model=ProjectPlan)
def create_new_project(data: ProjectPlanCreate):
    """Start from scratch: insert all financial parameters and generate dynamic daily expense allowance."""
    return db.create_project_plan(data.model_dump())

@router.post("/log-daily-spend", response_model=ProjectPlan)
def log_daily_expense(entry: DailyExpenseEntry):
    """Log an expense for a specific day.
    If the spend exceeds the day's allowance, dynamically update the existing project in-place
    (re-balancing the remaining days' caps and adjusting future months' targets).
    """
    if entry.day < 1 or entry.day > 30:
        raise HTTPException(status_code=400, detail="Day must be between 1 and 30")
    if entry.amount < 0:
        raise HTTPException(status_code=400, detail="Expense amount cannot be negative")
    
    return db.log_daily_expense(day=entry.day, amount=entry.amount, note=entry.note or "Daily spend")

@router.post("/reset", response_model=ProjectPlan)
def reset_project_demo():
    """Reset to the default interactive demonstration state."""
    db.project_plan = db._init_default_project_plan()
    return db.project_plan
