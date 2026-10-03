"""Wealth AI - ML Categorizer & Natural Language Transaction Parser
Implements TF-IDF + Logistic Regression with Continuous Learning from User Feedback.
"""
import re
import numpy as np
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Curated seed training dataset for Financial Transactions
INITIAL_TRAINING_CORPUS = [
    # Food & Dining / Delivery
    ("swiggy food delivery", "Food", "Delivery"),
    ("zomato online order biryani", "Food", "Delivery"),
    ("starbucks coffee and croissant", "Food", "Dining"),
    ("mcdonalds burger meal", "Food", "Dining"),
    ("dinner with friends at barbeque nation", "Food", "Dining"),
    ("lunch cafe coffee day", "Food", "Dining"),
    ("chai point tea and snacks", "Food", "Dining"),
    ("blinkit milk bread eggs vegetables", "Food", "Groceries"),
    ("zepto grocery quick delivery", "Food", "Groceries"),
    ("instamart fruits grocery essentials", "Food", "Groceries"),
    ("bigbasket weekly groceries supermarket", "Food", "Groceries"),
    ("dominos pizza delivery", "Food", "Delivery"),
    ("subway sandwich lunch", "Food", "Dining"),

    # Transportation
    ("uber ride to office", "Transportation", "Cab"),
    ("uber trip home airport", "Transportation", "Cab"),
    ("ola cabs auto ride", "Transportation", "Cab"),
    ("rapido bike ride commute", "Transportation", "Cab"),
    ("shell petrol pump fuel refill", "Transportation", "Fuel"),
    ("indian oil diesel petrol car", "Transportation", "Fuel"),
    ("hp fuel filling station", "Transportation", "Fuel"),
    ("metro card smart recharge", "Transportation", "Public Transit"),
    ("fastag toll recharge tollway", "Transportation", "Toll"),
    ("parking fee mall airport", "Transportation", "Parking"),

    # Shopping & Electronics
    ("amazon online shopping electronics", "Shopping", "Electronics"),
    ("amazon prime order headphones", "Shopping", "Electronics"),
    ("flipkart smartphone order", "Shopping", "Electronics"),
    ("myntra t-shirt sneakers clothing", "Shopping", "Apparel"),
    ("zara jacket pants clothing store", "Shopping", "Apparel"),
    ("h&m fashion clothing shopping", "Shopping", "Apparel"),
    ("ajio clothes footwear", "Shopping", "Apparel"),
    ("croma electronics gadgets appliance", "Shopping", "Electronics"),
    ("apple store iphone macbook accessories", "Shopping", "Electronics"),
    ("ikea home furniture decor", "Shopping", "Home"),

    # Entertainment & Subscriptions
    ("netflix monthly standard plan subscription", "Entertainment", "Streaming"),
    ("spotify premium music subscription", "Entertainment", "Streaming"),
    ("youtube premium membership", "Entertainment", "Streaming"),
    ("disney hotstar super annual plan", "Entertainment", "Streaming"),
    ("amazon prime video subscription", "Entertainment", "Streaming"),
    ("bookmyshow movie cinema tickets imax", "Entertainment", "Movies"),
    ("steam video games purchase", "Entertainment", "Gaming"),
    ("playstation store game pass", "Entertainment", "Gaming"),

    # Utilities & Bills
    ("electricity bill payment tata power", "Utilities", "Electricity"),
    ("bescom electricity monthly power bill", "Utilities", "Electricity"),
    ("water bill municipal corporation", "Utilities", "Water"),
    ("jio fiber high speed broadband internet bill", "Utilities", "Internet"),
    ("airtel broadband wifi monthly bill", "Utilities", "Internet"),
    ("airtel prepaid mobile phone recharge", "Utilities", "Mobile"),
    ("jio recharge 5g unlimited data", "Utilities", "Mobile"),
    ("png piped gas bill adani gas", "Utilities", "Gas"),

    # Housing & Rent
    ("monthly house rent payment to landlord", "Housing", "Rent"),
    ("apartment flat maintenance fee society", "Housing", "Maintenance"),
    ("house maid helper cook monthly salary", "Housing", "Domestic"),
    ("urban company home deep cleaning repair", "Housing", "Services"),

    # Health & Fitness
    ("apollo pharmacy medicines prescription", "Health", "Pharmacy"),
    ("1mg online medicines vitamins health", "Health", "Pharmacy"),
    ("practo doctor consultation clinic fee", "Health", "Doctor"),
    ("cult fit gym annual membership fitness", "Health", "Fitness"),
    ("dental checkup clinic teeth cleaning", "Health", "Doctor"),

    # Investments & Savings
    ("zerodha coin mutual fund sip debit", "Investment", "Mutual Funds"),
    ("groww equity stock market shares", "Investment", "Stocks"),
    ("tata mutual fund monthly systematic investment", "Investment", "Mutual Funds"),
    ("digital gold investment sovereign gold", "Investment", "Gold"),
    ("fixed deposit deposit creation bank", "Investment", "FD"),

    # Income
    ("monthly salary credit employer payroll direct deposit", "Salary", "Salary"),
    ("freelance client project invoice payment received", "Salary", "Freelance"),
    ("dividend credit securities bank interest", "Salary", "Dividends")
]

class MLCategorizer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, lowercase=True)
        self.classifier = LogisticRegression(C=1.5, max_iter=200, random_state=42)
        self.categories: list[str] = []
        self.feedback_history: list[dict] = []
        self.train_data = list(INITIAL_TRAINING_CORPUS)
        self._fit_model()

    def _fit_model(self):
        texts = [item[0] for item in self.train_data]
        labels = [item[1] for item in self.train_data]
        X = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X, labels)
        self.categories = list(self.classifier.classes_)

    def predict(self, text: str) -> tuple[str, str, float, dict[str, float]]:
        """Predict category and subcategory along with confidence distribution."""
        if not text.strip():
            return "Other", "General", 0.5, {}

        X = self.vectorizer.transform([text.lower()])
        probs = self.classifier.predict_proba(X)[0]
        max_idx = int(np.argmax(probs))
        pred_cat = self.categories[max_idx]
        confidence = float(probs[max_idx])

        # Distribution map
        dist = {cat: round(float(p), 4) for cat, p in zip(self.categories, probs)}

        # Find best matching subcategory
        subcat = self._infer_subcategory(text, pred_cat)
        return pred_cat, subcat, round(confidence, 4), dist

    def _infer_subcategory(self, text: str, category: str) -> str:
        text_lower = text.lower()
        subcat_rules = {
            "Food": [("grocery", "Groceries"), ("blinkit", "Groceries"), ("zepto", "Groceries"),
                     ("instamart", "Groceries"), ("milk", "Groceries"), ("dinner", "Dining"),
                     ("lunch", "Dining"), ("cafe", "Dining"), ("starbucks", "Dining"),
                     ("swiggy", "Delivery"), ("zomato", "Delivery"), ("pizza", "Delivery")],
            "Transportation": [("uber", "Cab"), ("ola", "Cab"), ("rapido", "Cab"),
                              ("fuel", "Fuel"), ("petrol", "Fuel"), ("diesel", "Fuel"),
                              ("metro", "Public Transit"), ("toll", "Toll"), ("parking", "Parking")],
            "Shopping": [("phone", "Electronics"), ("iphone", "Electronics"), ("macbook", "Electronics"),
                         ("headphones", "Electronics"), ("laptop", "Electronics"), ("shirt", "Apparel"),
                         ("zara", "Apparel"), ("myntra", "Apparel"), ("shoes", "Apparel")],
            "Entertainment": [("netflix", "Streaming"), ("spotify", "Streaming"), ("movie", "Movies"),
                              ("bookmyshow", "Movies"), ("game", "Gaming"), ("steam", "Gaming")],
            "Utilities": [("power", "Electricity"), ("electricity", "Electricity"), ("bescom", "Electricity"),
                          ("water", "Water"), ("wifi", "Internet"), ("broadband", "Internet"),
                          ("mobile", "Mobile"), ("recharge", "Mobile")],
            "Health": [("pharmacy", "Pharmacy"), ("medicine", "Pharmacy"), ("apollo", "Pharmacy"),
                       ("gym", "Fitness"), ("fitness", "Fitness"), ("doctor", "Doctor")],
            "Housing": [("rent", "Rent"), ("landlord", "Rent"), ("maintenance", "Maintenance"),
                        ("society", "Maintenance")],
            "Investment": [("sip", "Mutual Funds"), ("fund", "Mutual Funds"), ("stock", "Stocks"),
                           ("zerodha", "Stocks"), ("gold", "Gold")],
            "Salary": [("salary", "Salary"), ("payroll", "Salary"), ("freelance", "Freelance"),
                       ("client", "Freelance"), ("dividend", "Dividends")]
        }
        for keyword, sub in subcat_rules.get(category, []):
            if keyword in text_lower:
                return sub
        return "General"

    def record_feedback(self, text: str, predicted_category: str, corrected_category: str, subcategory: str = "General") -> bool:
        """Add user feedback and incrementally retrain the ML model."""
        self.feedback_history.append({
            "text": text,
            "predicted": predicted_category,
            "corrected": corrected_category,
            "timestamp": datetime.utcnow().isoformat()
        })
        # Add feedback sample with high sample weight by adding duplicate positive reinforcement
        self.train_data.append((text, corrected_category, subcategory))
        self.train_data.append((text, corrected_category, subcategory))
        self._fit_model()
        return True

    def parse_natural_language(self, nl_text: str) -> dict:
        """Parse text like 'Spent 450 on dinner with friends' or 'Swiggy 438'."""
        text = nl_text.strip()

        # Extract amount using regex
        amount = 0.0
        amount_patterns = [
            r'(?:₹|rs\.?|inr|\$)\s*([0-9,]+(?:\.[0-9]{1,2})?)',
            r'\b([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:₹|rs\.?|inr|\$|rupees)\b',
            r'\b(?:spent|paid|for|cost|amount|of)\s+([0-9,]+(?:\.[0-9]{1,2})?)\b',
            r'\b([0-9]+(?:\.[0-9]{1,2})?)\b'
        ]

        cleaned_text = text
        for pat in amount_patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                raw_amt = match.group(1).replace(',', '')
                try:
                    amount = float(raw_amt)
                    # Remove amount phrase from merchant inference
                    cleaned_text = text[:match.start()] + text[match.end():]
                    break
                except ValueError:
                    continue

        if amount == 0.0:
            amount = 100.0  # default fallback if unparseable

        # Determine transaction type
        tx_type = "expense"
        if any(term in text.lower() for term in ["salary", "received", "credited", "income", "client paid", "deposit"]):
            tx_type = "income"

        # Merchant extraction
        merchant = self._extract_merchant(cleaned_text, text)
        description = text

        # Predict ML Category
        category, subcategory, confidence, dist = self.predict(f"{merchant} {description}")

        today_str = datetime.utcnow().strftime("%Y-%m-%d")

        return {
            "amount": amount,
            "currency": "INR",
            "merchant": merchant,
            "description": description,
            "category": category,
            "subcategory": subcategory,
            "confidence": confidence,
            "distribution": dist,
            "transaction_date": today_str,
            "transaction_type": tx_type,
            "source": "natural_language"
        }

    def _extract_merchant(self, cleaned: str, original: str) -> str:
        known_merchants = [
            "Swiggy", "Zomato", "Uber", "Ola", "Amazon", "Flipkart", "Netflix",
            "Spotify", "Starbucks", "Blinkit", "Zepto", "Instamart", "McDonalds",
            "Apple", "Zara", "Myntra", "Cult.fit", "Apollo", "Airtel", "Jio", "BESCOM"
        ]
        for m in known_merchants:
            if m.lower() in original.lower():
                return m

        # Extract words after 'at', 'to', 'on', 'with'
        match = re.search(r'\b(?:at|to|on)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:with|for|yesterday|today)|$)', cleaned, re.IGNORECASE)
        if match:
            cand = match.group(1).strip()
            if cand and len(cand) < 25:
                return cand.title()

        # Fallback to first 2-3 words of cleaned
        words = [w for w in re.sub(r'[^a-zA-Z\s]', '', cleaned).split() if len(w) > 2 and w.lower() not in ['spent', 'paid', 'for', 'with', 'the', 'and']]
        if words:
            return " ".join(words[:2]).title()
        return "Retail Expense"

# Global singleton
categorizer = MLCategorizer()
