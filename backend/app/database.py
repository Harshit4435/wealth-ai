"""Wealth AI - In-Memory & File-backed Store
Stores transactions, feedback logs, proactive alerts, and user profiles.
"""
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.ml.seed_data import generate_seed_transactions

class MemoryDatabase:
    def __init__(self):
        self.transactions: List[Dict[str, Any]] = generate_seed_transactions()
        self.feedback_logs: List[Dict[str, Any]] = []
        self.proactive_alerts: List[Dict[str, Any]] = [
            {
                "id": "alert_food_surge",
                "type": "surge",
                "title": "🔔 Spending Alert",
                "message": "You've spent ₹8,100 on Food this month. Your normal monthly average is ₹5,500 (+47.2% surge).",
                "severity": "warning",
                "timestamp": "Just now",
                "action_label": "View Food Breakdown",
                "action_type": "filter_food"
            },
            {
                "id": "alert_subscription",
                "type": "subscription",
                "title": "💡 Subscription Detected",
                "message": "We noticed a recurring ₹799 payment to XYZ App. You haven't recorded any related activity recently. Review subscription?",
                "severity": "info",
                "timestamp": "Yesterday",
                "action_label": "Cancel / Review",
                "action_type": "review_subscription"
            },
            {
                "id": "alert_savings_milestone",
                "type": "savings_win",
                "title": "📈 Good Month",
                "message": "You've saved ₹6,400 more than your 3-month baseline! At this pace, your emergency fund will reach ₹50,000 in ~4 months.",
                "severity": "success",
                "timestamp": "2 days ago",
                "action_label": "Add to Emergency Fund",
                "action_type": "open_savings_goal"
            }
        ]

    def get_all_transactions(self) -> List[Dict[str, Any]]:
        # Sort by transaction_date descending
        return sorted(self.transactions, key=lambda x: x.get("transaction_date", ""), reverse=True)

    def add_transaction(self, tx_data: Dict[str, Any]) -> Dict[str, Any]:
        tx_id = f"tx_{uuid.uuid4().hex[:10]}"
        new_tx = {
            "id": tx_id,
            "user_id": tx_data.get("user_id", "user_default"),
            "amount": float(tx_data["amount"]),
            "currency": tx_data.get("currency", "INR"),
            "merchant": tx_data["merchant"],
            "description": tx_data["description"],
            "category": tx_data.get("category", "Other"),
            "subcategory": tx_data.get("subcategory", "General"),
            "confidence": float(tx_data.get("confidence", 1.0)),
            "is_anomaly": bool(tx_data.get("is_anomaly", False)),
            "anomaly_reason": tx_data.get("anomaly_reason"),
            "transaction_date": tx_data.get("transaction_date", datetime.utcnow().strftime("%Y-%m-%d")),
            "transaction_type": tx_data.get("transaction_type", "expense"),
            "source": tx_data.get("source", "manual"),
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        self.transactions.insert(0, new_tx)
        return new_tx

    def get_transaction_by_id(self, tx_id: str) -> Optional[Dict[str, Any]]:
        for tx in self.transactions:
            if tx["id"] == tx_id:
                return tx
        return None

    def update_transaction_category(self, tx_id: str, new_category: str, new_subcategory: Optional[str] = None) -> Optional[Dict[str, Any]]:
        tx = self.get_transaction_by_id(tx_id)
        if tx:
            old_cat = tx.get("category", "")
            tx["category"] = new_category
            if new_subcategory:
                tx["subcategory"] = new_subcategory
            tx["confidence"] = 1.0  # user verified

            # Record feedback
            self.feedback_logs.append({
                "id": f"fb_{uuid.uuid4().hex[:8]}",
                "transaction_id": tx_id,
                "text": f"{tx['merchant']} {tx['description']}",
                "predicted_category": old_cat,
                "corrected_category": new_category,
                "timestamp": datetime.utcnow().isoformat()
            })
            return tx
        return None

    def delete_transaction(self, tx_id: str) -> bool:
        initial_len = len(self.transactions)
        self.transactions = [t for t in self.transactions if t["id"] != tx_id]
        return len(self.transactions) < initial_len

    def get_alerts(self) -> List[Dict[str, Any]]:
        return self.proactive_alerts

    def dismiss_alert(self, alert_id: str) -> bool:
        self.proactive_alerts = [a for a in self.proactive_alerts if a["id"] != alert_id]
        return True

    def get_user_profile(self) -> Dict[str, Any]:
        if not hasattr(self, 'user_profile') or not self.user_profile:
            self.user_profile = {
                "monthly_income": 65000.0,
                "pays_rent": True,
                "rent_amount": 18000.0,
                "other_fixed_bills": 4200.0,
                "savings_goal_type": "Emergency Fund",
                "goal_name": "Emergency Reserve",
                "target_savings_per_month": 15000.0,
                "target_total_goal": 100000.0,
                "savings_timeline_months": 12
            }
        return self.user_profile

    def update_user_profile(self, data: Dict[str, Any]) -> Dict[str, Any]:
        curr = self.get_user_profile()
        curr.update(data)
        self.user_profile = curr
        return curr

    def generate_savings_plan(self) -> Dict[str, Any]:
        profile = self.get_user_profile()
        income = float(profile.get("monthly_income", 65000.0))
        pays_rent = profile.get("pays_rent", True)
        rent = float(profile.get("rent_amount", 0.0)) if pays_rent else 0.0
        other_bills = float(profile.get("other_fixed_bills", 4200.0))
        target_savings = float(profile.get("target_savings_per_month", 15000.0))
        total_goal = float(profile.get("target_total_goal", 100000.0))
        
        # Fixed needs includes rent + utilities + base groceries (estimated at ~₹6,000)
        base_living = 6000.0
        fixed_needs_total = rent + other_bills + base_living
        
        # Wants allowance is the remaining discretionary buffer
        wants_allowance = max(0.0, income - fixed_needs_total - target_savings)
        daily_discretionary = round(wants_allowance / 30.0, 2)
        weekly_discretionary = round(daily_discretionary * 7.0, 2)
        
        fixed_pct = round((fixed_needs_total / income * 100.0), 1) if income > 0 else 0
        savings_pct = round((target_savings / income * 100.0), 1) if income > 0 else 0
        wants_pct = round(max(0.0, 100.0 - fixed_pct - savings_pct), 1)
        
        # Months to reach overall milestone
        import math
        months_to_target = math.ceil(total_goal / target_savings) if target_savings > 0 else 12
        
        # Timeline milestones
        timeline = []
        milestone_months = [1, 3, 6, 9, 12, 18, 24]
        for m in milestone_months:
            total_saved = m * target_savings
            goal_pct = min(100.0, round((total_saved / total_goal * 100.0), 1)) if total_goal > 0 else 100.0
            hit_note = None
            if total_saved >= total_goal and (m - 1) * target_savings < total_goal:
                hit_note = f"🎯 {profile.get('goal_name', 'Goal')} Fully Achieved!"
            elif m == 3 and total_saved >= 40000:
                hit_note = "🛡️ 1-Month Living Runway Reached"
            elif m == 6 and total_saved >= 90000:
                hit_note = "⭐ 3-Month Emergency Shield Complete"

            timeline.append({
                "month": m,
                "label": f"Month {m}",
                "total_saved": total_saved,
                "goal_percentage": goal_pct,
                "milestone_hit": hit_note
            })

        budget_breakdown = [
            {"category": "Essential Needs", "amount": fixed_needs_total, "percentage": fixed_pct, "color": "emerald", "items": f"Rent (₹{int(rent):,}) + Bills (₹{int(other_bills):,}) + Staples (₹{int(base_living):,})"},
            {"category": "Savings Target", "amount": target_savings, "percentage": savings_pct, "color": "cyan", "items": f"{profile.get('goal_name', 'Goal')} @ ₹{int(target_savings):,}/mo"},
            {"category": "Discretionary Wants", "amount": wants_allowance, "percentage": wants_pct, "color": "amber", "items": f"Dining, shopping, leisure (₹{int(daily_discretionary):,}/day)"}
        ]

        status = "Optimal"
        insights = []
        
        rent_ratio = (rent / income * 100.0) if income > 0 else 0
        if rent_ratio > 35.0:
            insights.append(f"Housing rent consumes {round(rent_ratio)}% of take-home pay (ideal is <30%).")
        elif not pays_rent:
            insights.append("Zero rent obligation! You can allocate higher capital to investments & compounding.")
        else:
            insights.append(f"Rent is at a healthy {round(rent_ratio)}% of monthly take-home income.")

        insights.append(f"At ₹{int(target_savings):,}/mo, you will achieve your full ₹{int(total_goal):,} {profile.get('goal_name', 'goal')} in approximately {months_to_target} months.")
        insights.append(f"To guarantee this savings target, maintain non-essential daily spending within ₹{int(daily_discretionary):,}/day.")

        return {
            "monthly_income": income,
            "rent_amount": rent,
            "other_fixed_bills": other_bills,
            "fixed_needs_total": fixed_needs_total,
            "fixed_needs_percentage": fixed_pct,
            "wants_allowance": wants_allowance,
            "wants_percentage": wants_pct,
            "target_savings": target_savings,
            "savings_percentage": savings_pct,
            "daily_discretionary_budget": daily_discretionary,
            "weekly_discretionary_budget": weekly_discretionary,
            "months_to_target": months_to_target,
            "projected_timeline": timeline,
            "budget_breakdown": budget_breakdown,
            "plan_status": status,
            "insights": insights
        }

db = MemoryDatabase()

