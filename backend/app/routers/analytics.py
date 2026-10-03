"""Wealth AI - Analytics Router
Computes spending distributions, category aggregations, and comparative historical trends.
"""
from fastapi import APIRouter
from typing import Dict, Any, List
from app.database import db

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def get_analytics_summary() -> Dict[str, Any]:
    txs = db.get_all_transactions()
    total_income = 0.0
    total_expense = 0.0
    category_totals: Dict[str, float] = {}

    for t in txs:
        amt = float(t.get("amount", 0))
        if t.get("transaction_type") == "income":
            total_income += amt
        else:
            total_expense += amt
            cat = t.get("category", "Other")
            category_totals[cat] = category_totals.get(cat, 0.0) + amt

    # Historical monthly comparison (from seed data)
    monthly_trends = [
        {"month": "June", "spending": 5200.0, "category_food": 5200.0},
        {"month": "July", "spending": 5600.0, "category_food": 5600.0},
        {"month": "August", "spending": 5400.0, "category_food": 5400.0},
        {"month": "September", "spending": 5800.0, "category_food": 5800.0},
        {"month": "October (Current)", "spending": 8100.0, "category_food": 8100.0}
    ]

    # Category breakdown percentages
    categories_list = []
    for cat, val in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        pct = (val / total_expense * 100) if total_expense > 0 else 0
        categories_list.append({
            "category": cat,
            "total_amount": round(val, 2),
            "percentage": round(pct, 1)
        })

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_savings": max(0.0, total_income - total_expense),
        "monthly_trends": monthly_trends,
        "category_breakdown": categories_list,
        "total_transactions": len(txs)
    }
