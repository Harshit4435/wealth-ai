"""Wealth AI - Realistic Transaction Seeder
Generates multi-month transaction history matching all scenarios from specification:
- Food delivery & dining (Swiggy, Zomato, Dinner with friends)
- Cabs (Uber, Ola)
- Shopping (Amazon, Flipkart, Zara)
- Recurring Subscriptions (Netflix, Spotify, XYZ recurring ₹799)
- Salary credits (₹65,000)
- Unusual activity anomaly (₹18,500)
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

def generate_seed_transactions() -> List[Dict[str, Any]]:
    transactions = []
    base_date = datetime.now()

    # Pre-defined real-world transactions
    raw_samples = [
        # Today / Recent
        {"merchant": "Swiggy", "amount": 438.0, "category": "Food", "subcategory": "Delivery", "desc": "Swiggy dinner order", "days_ago": 0, "type": "expense"},
        {"merchant": "Uber", "amount": 216.0, "category": "Transportation", "subcategory": "Cab", "desc": "Uber ride to work", "days_ago": 0, "type": "expense"},
        {"merchant": "Amazon", "amount": 1299.0, "category": "Shopping", "subcategory": "Electronics", "desc": "Amazon wireless earbuds", "days_ago": 1, "type": "expense"},
        {"merchant": "Dinner with Friends", "amount": 450.0, "category": "Food", "subcategory": "Dining", "desc": "Dinner with friends at cafe", "days_ago": 1, "type": "expense"},
        {"merchant": "Netflix", "amount": 649.0, "category": "Entertainment", "subcategory": "Streaming", "desc": "Netflix 4K subscription", "days_ago": 2, "type": "expense"},
        {"merchant": "Zomato", "amount": 540.0, "category": "Food", "subcategory": "Delivery", "desc": "Zomato lunch biryani", "days_ago": 2, "type": "expense"},
        {"merchant": "Blinkit", "amount": 890.0, "category": "Food", "subcategory": "Groceries", "desc": "Blinkit fresh dairy & fruits", "days_ago": 3, "type": "expense"},
        {"merchant": "Shell Fuel", "amount": 1850.0, "category": "Transportation", "subcategory": "Fuel", "desc": "Petrol refill for car", "days_ago": 4, "type": "expense"},
        {"merchant": "Airtel Broadband", "amount": 1179.0, "category": "Utilities", "subcategory": "Internet", "desc": "Airtel fiber 200Mbps bill", "days_ago": 5, "type": "expense"},
        {"merchant": "XYZ App", "amount": 799.0, "category": "Entertainment", "subcategory": "Streaming", "desc": "Recurring monthly membership", "days_ago": 6, "type": "expense"},
        {"merchant": "Apollo Pharmacy", "amount": 620.0, "category": "Health", "subcategory": "Pharmacy", "desc": "Daily multivitamins and protein", "days_ago": 7, "type": "expense"},
        {"merchant": "Starbucks", "amount": 390.0, "category": "Food", "subcategory": "Dining", "desc": "Cold brew and bagel", "days_ago": 8, "type": "expense"},

        # Unusual activity anomaly
        {"merchant": "Croma Electronics", "amount": 18500.0, "category": "Shopping", "subcategory": "Electronics", "desc": "Monitor and mechanical keyboard", "days_ago": 9, "type": "expense", "is_anomaly": True, "anomaly_reason": "Unusual activity: ₹18,500 is 4.8x higher than typical shopping baseline."},

        # Start of current month
        {"merchant": "Acme Corp Payroll", "amount": 65000.0, "category": "Salary", "subcategory": "Salary", "desc": "Monthly salary credit", "days_ago": 12, "type": "income"},
        {"merchant": "Landlord Rent", "amount": 18000.0, "category": "Housing", "subcategory": "Rent", "desc": "Apartment monthly rent", "days_ago": 12, "type": "expense"},
        {"merchant": "Tata Power BESCOM", "amount": 2150.0, "category": "Utilities", "subcategory": "Electricity", "desc": "Electricity consumption bill", "days_ago": 13, "type": "expense"},
        {"merchant": "Zerodha Coin", "amount": 5000.0, "category": "Investment", "subcategory": "Mutual Funds", "desc": "Nifty 50 Index Fund SIP", "days_ago": 14, "type": "expense"},

        # Additional historical entries for trend analysis
        {"merchant": "Swiggy", "amount": 620.0, "category": "Food", "subcategory": "Delivery", "desc": "Weekend family dinner", "days_ago": 15, "type": "expense"},
        {"merchant": "Cult.fit", "amount": 1499.0, "category": "Health", "subcategory": "Fitness", "desc": "Monthly gym access pass", "days_ago": 16, "type": "expense"},
        {"merchant": "Uber", "amount": 340.0, "category": "Transportation", "subcategory": "Cab", "desc": "Uber trip airport", "days_ago": 18, "type": "expense"},
        {"merchant": "Instamart", "amount": 780.0, "category": "Food", "subcategory": "Groceries", "desc": "Kitchen staples", "days_ago": 20, "type": "expense"},
        {"merchant": "BookMyShow", "amount": 850.0, "category": "Entertainment", "subcategory": "Movies", "desc": "2 IMAX movie tickets", "days_ago": 22, "type": "expense"},
        {"merchant": "Zara", "amount": 3490.0, "category": "Shopping", "subcategory": "Apparel", "desc": "Linen shirts & trousers", "days_ago": 25, "type": "expense"},

        # Previous Month (September)
        {"merchant": "Acme Corp Payroll", "amount": 65000.0, "category": "Salary", "subcategory": "Salary", "desc": "September salary credit", "days_ago": 42, "type": "income"},
        {"merchant": "Landlord Rent", "amount": 18000.0, "category": "Housing", "subcategory": "Rent", "desc": "September apartment rent", "days_ago": 42, "type": "expense"},
        {"merchant": "Food & Dining Aggregate", "amount": 5800.0, "category": "Food", "subcategory": "Dining", "desc": "September dining total", "days_ago": 45, "type": "expense"},

        # Two Months Ago (August)
        {"merchant": "Acme Corp Payroll", "amount": 65000.0, "category": "Salary", "subcategory": "Salary", "desc": "August salary credit", "days_ago": 72, "type": "income"},
        {"merchant": "Food & Dining Aggregate", "amount": 5400.0, "category": "Food", "subcategory": "Dining", "desc": "August dining total", "days_ago": 75, "type": "expense"},

        # Three Months Ago (July)
        {"merchant": "Acme Corp Payroll", "amount": 65000.0, "category": "Salary", "subcategory": "Salary", "desc": "July salary credit", "days_ago": 102, "type": "income"},
        {"merchant": "Food & Dining Aggregate", "amount": 5600.0, "category": "Food", "subcategory": "Dining", "desc": "July dining total", "days_ago": 105, "type": "expense"},

        # Four Months Ago (June)
        {"merchant": "Acme Corp Payroll", "amount": 65000.0, "category": "Salary", "subcategory": "Salary", "desc": "June salary credit", "days_ago": 132, "type": "income"},
        {"merchant": "Food & Dining Aggregate", "amount": 5200.0, "category": "Food", "subcategory": "Dining", "desc": "June dining total", "days_ago": 135, "type": "expense"}
    ]

    for item in raw_samples:
        tx_date = (base_date - timedelta(days=item["days_ago"])).strftime("%Y-%m-%d")
        confidence = 0.94 if item.get("category") in ["Food", "Transportation", "Shopping"] else 0.88
        transactions.append({
            "id": f"tx_{uuid.uuid4().hex[:10]}",
            "user_id": "user_default",
            "amount": float(item["amount"]),
            "currency": "INR",
            "merchant": item["merchant"],
            "description": item["desc"],
            "category": item["category"],
            "subcategory": item.get("subcategory", "General"),
            "confidence": confidence,
            "is_anomaly": item.get("is_anomaly", False),
            "anomaly_reason": item.get("anomaly_reason"),
            "transaction_date": tx_date,
            "transaction_type": item["type"],
            "source": "seed_data",
            "created_at": tx_date + "T10:00:00Z"
        })

    return transactions
