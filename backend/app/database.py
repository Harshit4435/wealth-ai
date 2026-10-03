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

db = MemoryDatabase()
