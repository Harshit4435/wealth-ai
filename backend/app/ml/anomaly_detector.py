"""Wealth AI - Spending Anomaly & Unusual Transaction Detector
Identifies unusual deviations and potential accidental double-charges without alarmist phrasing.
"""
from typing import Dict, Any, Tuple

class AnomalyDetector:
    def __init__(self):
        # Baseline normal ranges (min, normal_max, hard_threshold)
        self.category_thresholds = {
            "Food": (50.0, 2500.0, 5000.0),
            "Transportation": (40.0, 1500.0, 3500.0),
            "Shopping": (200.0, 5000.0, 15000.0),
            "Entertainment": (100.0, 1800.0, 4500.0),
            "Utilities": (200.0, 4000.0, 9000.0),
            "Housing": (1000.0, 25000.0, 40000.0),
            "Health": (100.0, 3000.0, 10000.0),
            "Investment": (500.0, 25000.0, 100000.0)
        }

    def evaluate(self, transaction: Dict[str, Any]) -> Tuple[bool, float, str]:
        """Assess if a transaction represents unusual activity.
        Returns: (is_anomaly, anomaly_score, reason)
        """
        amount = float(transaction.get("amount", 0))
        category = transaction.get("category", "Shopping")
        merchant = transaction.get("merchant", "Merchant")

        # Income is rarely an expense anomaly
        if transaction.get("transaction_type") == "income":
            return False, 0.0, "Standard income credit"

        min_val, normal_max, hard_threshold = self.category_thresholds.get(
            category, (100.0, 3000.0, 10000.0)
        )

        if amount >= hard_threshold:
            multiplier = round(amount / normal_max, 1)
            reason = (
                f"Unusual activity detected: ₹{amount:,.0f} at {merchant} is {multiplier}x higher "
                f"than your typical {category} spending threshold (₹{normal_max:,.0f})."
            )
            return True, 0.92, reason

        if amount > normal_max * 1.75:
            multiplier = round(amount / normal_max, 1)
            reason = (
                f"Elevated transaction: ₹{amount:,.0f} is {multiplier}x above your regular "
                f"{category} baseline."
            )
            return True, 0.68, reason

        return False, 0.1, "Within normal historical bounds"

anomaly_detector = AnomalyDetector()
