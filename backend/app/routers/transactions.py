"""Wealth AI - Transactions Router
CRUD, Natural Language Input Parser, CSV Upload, and ML Category Feedback loop.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
import io
import csv

from app.schemas import (
    TransactionCreate,
    TransactionResponse,
    NaturalLanguageInput,
    CategoryCorrection
)
from app.database import db
from app.ml.categorizer import categorizer
from app.ml.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionResponse])
def list_transactions(category: Optional[str] = None, limit: int = 100):
    txs = db.get_all_transactions()
    if category:
        txs = [t for t in txs if t.get("category", "").lower() == category.lower()]
    return txs[:limit]

@router.post("", response_model=TransactionResponse)
def create_transaction(tx_in: TransactionCreate):
    tx_dict = tx_in.dict()

    # If category not provided, auto-categorize with ML
    if not tx_dict.get("category"):
        text = f"{tx_dict.get('merchant', '')} {tx_dict.get('description', '')}"
        cat, subcat, conf, _ = categorizer.predict(text)
        tx_dict["category"] = cat
        tx_dict["subcategory"] = subcat
        tx_dict["confidence"] = conf

    # Run anomaly detector
    is_anomaly, score, reason = anomaly_detector.evaluate(tx_dict)
    tx_dict["is_anomaly"] = is_anomaly
    tx_dict["anomaly_reason"] = reason if is_anomaly else None

    new_tx = db.add_transaction(tx_dict)
    return new_tx

@router.post("/parse-nl", response_model=TransactionResponse)
def parse_natural_language_transaction(nl: NaturalLanguageInput):
    """Layer 1: Parse natural-language input like 'Spent 450 on dinner with friends' or 'Swiggy 438'."""
    parsed = categorizer.parse_natural_language(nl.text)

    # Evaluate anomaly
    is_anomaly, score, reason = anomaly_detector.evaluate(parsed)
    parsed["is_anomaly"] = is_anomaly
    parsed["anomaly_reason"] = reason if is_anomaly else None

    # Automatically save and return
    saved_tx = db.add_transaction(parsed)
    return saved_tx

@router.post("/correct", response_model=TransactionResponse)
def correct_transaction_category(correction: CategoryCorrection):
    """Layer 2: When user corrects category, record feedback & retrain ML model."""
    tx = db.get_transaction_by_id(correction.transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    old_cat = tx.get("category", "Other")
    updated_tx = db.update_transaction_category(
        correction.transaction_id,
        correction.corrected_category,
        correction.corrected_subcategory
    )

    # Feed into ML categorizer continuous learning pipeline
    merchant_desc = f"{tx['merchant']} {tx['description']}"
    categorizer.record_feedback(
        merchant_desc,
        old_cat,
        correction.corrected_category,
        correction.corrected_subcategory or "General"
    )

    return updated_tx

@router.post("/upload-csv")
async def upload_bank_csv(file: UploadFile = File(...)):
    """Upload CSV / bank statement transactions."""
    content = await file.read()
    text = content.decode('utf-8', errors='ignore')
    reader = csv.DictReader(io.StringIO(text))

    imported_count = 0
    for row in reader:
        # Generic CSV column matching
        merchant = row.get("Merchant") or row.get("Description") or row.get("Details") or "Bank Transfer"
        amount_raw = row.get("Amount") or row.get("Debit") or row.get("Spend") or "0"
        tx_date = row.get("Date") or row.get("Transaction Date") or "2026-10-01"

        try:
            amount = abs(float(str(amount_raw).replace(",", "").replace("₹", "").strip()))
        except ValueError:
            continue

        cat, subcat, conf, _ = categorizer.predict(merchant)
        tx_dict = {
            "amount": amount,
            "currency": "INR",
            "merchant": merchant[:40],
            "description": merchant,
            "category": cat,
            "subcategory": subcat,
            "confidence": conf,
            "transaction_date": tx_date,
            "transaction_type": "expense",
            "source": "csv_upload"
        }
        db.add_transaction(tx_dict)
        imported_count += 1

    return {"message": f"Successfully processed and auto-categorized {imported_count} transactions from CSV."}

@router.delete("/{tx_id}")
def delete_transaction(tx_id: str):
    success = db.delete_transaction(tx_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"success": True, "message": "Transaction deleted"}
