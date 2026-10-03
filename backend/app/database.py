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

    def log_visit(self, visit_data: Dict[str, Any]) -> Dict[str, Any]:
        if not hasattr(self, 'visitors'):
            self.visitors = []
        visit_record = {
            "id": f"v_{uuid.uuid4().hex[:8]}",
            "ip": visit_data.get("ip", "127.0.0.1"),
            "path": visit_data.get("path", "/"),
            "device": visit_data.get("device", "Desktop"),
            "browser": visit_data.get("browser", "Chrome"),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        self.visitors.insert(0, visit_record)
        if len(self.visitors) > 500:
            self.visitors = self.visitors[:500]
        return visit_record

    def log_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        if not hasattr(self, 'events'):
            self.events = []
        ev_record = {
            "id": f"ev_{uuid.uuid4().hex[:8]}",
            "event_name": event_data.get("event_name", "action"),
            "details": event_data.get("details", {}),
            "ip": event_data.get("ip", "127.0.0.1"),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        self.events.insert(0, ev_record)
        if len(self.events) > 1000:
            self.events = self.events[:1000]
        return ev_record

    def get_telemetry_summary(self) -> Dict[str, Any]:
        if not hasattr(self, 'visitors'):
            self.visitors = []
        if not hasattr(self, 'events'):
            self.events = []

        unique_ips = len(set(v.get("ip") for v in self.visitors))
        total_visits = len(self.visitors)
        total_events = len(self.events)

        # Count event types
        event_counts = {}
        for ev in self.events:
            name = ev.get("event_name", "generic")
            event_counts[name] = event_counts.get(name, 0) + 1

        return {
            "unique_visitors": unique_ips or 1,
            "total_pageviews": total_visits or 1,
            "total_actions": total_events or 1,
            "feature_breakdown": event_counts,
            "recent_visitors": self.visitors[:20],
            "recent_events": self.events[:25]
        }

    def _init_default_project_plan(self) -> Dict[str, Any]:
        income = 65000.0
        rent = 18000.0
        bills = 4200.0
        staples = 6000.0
        target_savings = 15000.0
        fixed_needs = rent + bills + staples
        wants_pool = max(0.0, income - fixed_needs - target_savings)
        daily_cap = round(wants_pool / 30.0, 2)
        
        # Seed first 3 days with realistic expenses for immediate visual feedback
        days_data = []
        sample_spends = {1: 520.0, 2: 640.0, 3: 1100.0}  # Day 3 has an overspend demonstration
        for d in range(1, 31):
            spent = sample_spends.get(d, 0.0)
            overspent = max(0.0, spent - daily_cap) if spent > 0 else 0.0
            status = 'upcoming'
            if spent > 0:
                status = 'overspent' if spent > daily_cap else 'within_budget'
            
            days_data.append({
                "day": d,
                "date_label": f"Day {d}",
                "expense_cap": daily_cap,
                "actual_spent": spent,
                "status": status,
                "overspent_amount": overspent
            })

        total_spent = sum(d["actual_spent"] for d in days_data if d["actual_spent"] > 0)
        total_overspent = sum(d["overspent_amount"] for d in days_data)
        remaining_days = len([d for d in days_data if d["actual_spent"] == 0])
        remaining_pool = max(0.0, wants_pool - total_spent)
        rebalanced_daily_cap = round(remaining_pool / remaining_days, 2) if remaining_days > 0 else 0.0
        
        # Apply rebalanced cap to remaining upcoming days
        for d in days_data:
            if d["actual_spent"] == 0:
                d["expense_cap"] = rebalanced_daily_cap

        future_projections = []
        for m in range(1, 13):
            future_projections.append({
                "month": m,
                "month_name": f"Month {m}",
                "target_savings": target_savings,
                "cumulative_saved": m * target_savings,
                "monthly_expense_cap": wants_pool,
                "status": "on_track"
            })

        return {
            "id": "proj_blueprint_primary",
            "project_name": "Financial Freedom Blueprint",
            "monthly_income": income,
            "rent_amount": rent,
            "other_fixed_bills": bills,
            "fixed_needs_total": fixed_needs,
            "target_monthly_savings": target_savings,
            "target_total_milestone": 100000.0,
            "total_months": 12,
            "wants_monthly_pool": wants_pool,
            "base_daily_allowance": daily_cap,
            "current_daily_allowance": rebalanced_daily_cap,
            "total_spent_this_month": total_spent,
            "total_overspent_this_month": total_overspent,
            "remaining_days_in_month": remaining_days,
            "days_data": days_data,
            "next_month_adjusted_target": target_savings,
            "future_months_projections": future_projections,
            "rebalancing_message": "Day 3 overspent by ₹373.33. Project updated in-place: Remaining days' allowance re-balanced to preserve ₹15,000 savings goal.",
            "status": "active"
        }

    def get_project_plan(self) -> Dict[str, Any]:
        if not hasattr(self, 'project_plan') or not self.project_plan:
            self.project_plan = self._init_default_project_plan()
        return self.project_plan

    def create_project_plan(self, data: Dict[str, Any]) -> Dict[str, Any]:
        income = float(data.get("monthly_income", 65000.0))
        pays_rent = data.get("pays_rent", True)
        rent = float(data.get("rent_amount", 0.0)) if pays_rent else 0.0
        bills = float(data.get("other_fixed_bills", 4200.0))
        staples = 6000.0
        fixed_needs = rent + bills + staples
        target_savings = float(data.get("target_monthly_savings", 15000.0))
        total_milestone = float(data.get("target_total_milestone", 100000.0))
        total_months = int(data.get("total_months", 12))
        project_name = data.get("project_name", "My Financial Blueprint")

        wants_pool = max(0.0, income - fixed_needs - target_savings)
        daily_cap = round(wants_pool / 30.0, 2)

        days_data = []
        for d in range(1, 31):
            days_data.append({
                "day": d,
                "date_label": f"Day {d}",
                "expense_cap": daily_cap,
                "actual_spent": 0.0,
                "status": "upcoming",
                "overspent_amount": 0.0
            })

        future_projections = []
        for m in range(1, total_months + 1):
            future_projections.append({
                "month": m,
                "month_name": f"Month {m}",
                "target_savings": target_savings,
                "cumulative_saved": m * target_savings,
                "monthly_expense_cap": wants_pool,
                "status": "on_track"
            })

        self.project_plan = {
            "id": f"proj_{uuid.uuid4().hex[:8]}",
            "project_name": project_name,
            "monthly_income": income,
            "rent_amount": rent,
            "other_fixed_bills": bills,
            "fixed_needs_total": fixed_needs,
            "target_monthly_savings": target_savings,
            "target_total_milestone": total_milestone,
            "total_months": total_months,
            "wants_monthly_pool": wants_pool,
            "base_daily_allowance": daily_cap,
            "current_daily_allowance": daily_cap,
            "total_spent_this_month": 0.0,
            "total_overspent_this_month": 0.0,
            "remaining_days_in_month": 30,
            "days_data": days_data,
            "next_month_adjusted_target": target_savings,
            "future_months_projections": future_projections,
            "rebalancing_message": f"Project '{project_name}' created from scratch. Daily allowance set to ₹{daily_cap:,.0f}/day.",
            "status": "active"
        }
        return self.project_plan

    def log_daily_expense(self, day: int, amount: float, note: str = "Daily expense") -> Dict[str, Any]:
        plan = self.get_project_plan()
        days_data = plan.get("days_data", [])
        wants_pool = float(plan.get("wants_monthly_pool", 21800.0))
        target_savings = float(plan.get("target_monthly_savings", 15000.0))
        base_cap = float(plan.get("base_daily_allowance", wants_pool / 30.0))

        # Locate the specific day
        target_day = None
        for d in days_data:
            if d["day"] == day:
                target_day = d
                break

        if not target_day:
            return plan

        allocated_cap = float(target_day.get("expense_cap", base_cap))
        target_day["actual_spent"] = float(amount)

        if amount > allocated_cap:
            overspent = round(amount - allocated_cap, 2)
            target_day["status"] = "overspent"
            target_day["overspent_amount"] = overspent
        else:
            target_day["status"] = "within_budget"
            target_day["overspent_amount"] = 0.0

        # Calculate monthly totals
        total_spent = sum(d["actual_spent"] for d in days_data if d["actual_spent"] > 0)
        total_overspent = sum(d["overspent_amount"] for d in days_data)
        upcoming_days = [d for d in days_data if d["actual_spent"] == 0 and d["day"] > day]
        remaining_count = len(upcoming_days)
        remaining_pool = wants_pool - total_spent

        rebalancing_msg = ""
        next_month_target = target_savings

        if remaining_count > 0:
            if remaining_pool > 0:
                new_daily_cap = round(remaining_pool / remaining_count, 2)
                for d in upcoming_days:
                    d["expense_cap"] = new_daily_cap
                plan["current_daily_allowance"] = new_daily_cap
                plan["next_month_adjusted_target"] = target_savings

                if amount > allocated_cap:
                    rebalancing_msg = (
                        f"⚡ Day {day} overspent by ₹{int(amount - allocated_cap):,}. "
                        f"Project updated in-place: Daily cap for remaining {remaining_count} days adjusted to "
                        f"₹{int(new_daily_cap):,}/day to preserve your ₹{int(target_savings):,} savings goal."
                    )
                else:
                    rebalancing_msg = (
                        f"✅ Day {day} expense of ₹{int(amount):,} is within cap. "
                        f"Daily cap for remaining {remaining_count} days is ₹{int(new_daily_cap):,}/day."
                    )
            else:
                # Discretionary pool exhausted! Deficit spills into future months
                deficit = abs(remaining_pool)
                new_daily_cap = 0.0
                for d in upcoming_days:
                    d["expense_cap"] = 0.0
                plan["current_daily_allowance"] = 0.0
                next_month_target = target_savings + deficit
                plan["next_month_adjusted_target"] = next_month_target
                rebalancing_msg = (
                    f"⚠️ Day {day} expense caused a net monthly overspend of ₹{int(deficit):,}! "
                    f"Project updated in-place: Remaining {remaining_count} days allowance set to ₹0. "
                    f"Future Month savings target rebalanced to ₹{int(next_month_target):,} to absorb deficit."
                )
        else:
            # End of month check
            if remaining_pool < 0:
                deficit = abs(remaining_pool)
                next_month_target = target_savings + deficit
                plan["next_month_adjusted_target"] = next_month_target
                rebalancing_msg = (
                    f"⚠️ Month ended with ₹{int(deficit):,} deficit. "
                    f"Project updated in-place: Future month savings target updated to ₹{int(next_month_target):,}."
                )
            else:
                surplus = remaining_pool
                rebalancing_msg = (
                    f"🎉 Month completed under budget! ₹{int(surplus):,} additional surplus accumulated."
                )

        # Update future months projections dynamically
        future_proj = plan.get("future_months_projections", [])
        if future_proj and len(future_proj) > 1:
            if next_month_target > target_savings:
                future_proj[1]["target_savings"] = next_month_target
                future_proj[1]["status"] = "rebalanced_recovery"
                future_proj[1]["monthly_expense_cap"] = max(0.0, wants_pool - (next_month_target - target_savings))
            else:
                future_proj[1]["target_savings"] = target_savings
                future_proj[1]["status"] = "on_track"
                future_proj[1]["monthly_expense_cap"] = wants_pool

            # Recalculate cumulative
            cum = 0.0
            for proj in future_proj:
                cum += proj["target_savings"]
                proj["cumulative_saved"] = cum

        plan["total_spent_this_month"] = round(total_spent, 2)
        plan["total_overspent_this_month"] = round(total_overspent, 2)
        plan["remaining_days_in_month"] = remaining_count
        plan["rebalancing_message"] = rebalancing_msg
        
        self.project_plan = plan
        return self.project_plan

db = MemoryDatabase()


