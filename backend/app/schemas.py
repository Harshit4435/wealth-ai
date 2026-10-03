"""Wealth AI - Data Models & Pydantic Schemas"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class TransactionBase(BaseModel):
    amount: float = Field(..., description="Transaction amount")
    currency: str = Field(default="INR", description="Currency code (e.g. INR, USD)")
    merchant: str = Field(..., description="Merchant name or entity")
    description: str = Field(..., description="Detailed description")
    category: Optional[str] = Field(default=None, description="Spending or income category")
    subcategory: Optional[str] = Field(default=None, description="Subcategory")
    transaction_date: str = Field(..., description="ISO date YYYY-MM-DD")
    transaction_type: str = Field(default="expense", description="'expense' or 'income'")
    source: str = Field(default="manual", description="Source: manual, natural_language, csv, receipt")

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: str
    user_id: str = "user_default"
    confidence: float = Field(default=1.0, description="ML categorization confidence score")
    is_anomaly: bool = Field(default=False, description="Whether this transaction was flagged as unusual")
    anomaly_reason: Optional[str] = None
    created_at: str

class NaturalLanguageInput(BaseModel):
    text: str = Field(..., example="Spent 450 on dinner with friends")

class CategoryCorrection(BaseModel):
    transaction_id: str
    corrected_category: str
    corrected_subcategory: Optional[str] = None

class FeedbackRecord(BaseModel):
    id: str
    transaction_id: str
    text: str
    predicted_category: str
    corrected_category: str
    timestamp: str

class CategoryBreakdown(BaseModel):
    category: str
    total_amount: float
    percentage: float
    transaction_count: int
    historical_avg: float
    status: str  # 'normal', 'elevated', 'critical'

class FinancialHealthScore(BaseModel):
    overall_score: int = Field(..., description="Overall 0-100 composite score")
    cash_flow_score: int
    savings_score: int
    spending_score: int
    debt_score: int
    consistency_score: int
    monthly_income: float
    monthly_spending: float
    expected_savings: float
    days_until_salary: int
    expected_remaining_buffer: float
    health_grade: str  # 'Excellent', 'Good', 'Needs Attention', 'Critical'
    indicators: List[Dict[str, Any]]
    recommendations: List[str]

class SpendingForecast(BaseModel):
    current_month_spent: float
    predicted_month_end: float
    historical_monthly_avg: float
    velocity_percent: float  # e.g. +40%
    remaining_days_in_month: int
    category_forecasts: List[Dict[str, Any]]
    insights: List[str]

class CopilotQuery(BaseModel):
    query: str = Field(..., example="Can I afford a ₹20,000 phone this month?")
    user_id: str = "user_default"

class CopilotCalculationDetails(BaseModel):
    current_liquid_balance: float
    monthly_income: float
    fixed_expenses_remaining: float
    discretionary_projected: float
    savings_target: float
    purchase_amount: float
    projected_buffer_now: float
    projected_buffer_wait_salary: float
    can_afford_now: bool

class CopilotResponse(BaseModel):
    answer: str
    intent: str
    calculations: Optional[CopilotCalculationDetails] = None
    recommendation: str
    tools_called: List[str]

class ProactiveAlert(BaseModel):
    id: str
    type: str  # 'surge', 'subscription', 'savings_win', 'anomaly'
    title: str
    message: str
    severity: str  # 'info', 'warning', 'success', 'alert'
    timestamp: str
    action_label: Optional[str] = None
    action_type: Optional[str] = None

class UserProfile(BaseModel):
    monthly_income: float = Field(default=65000.0, description="Monthly net take-home salary or income")
    pays_rent: bool = Field(default=True, description="Whether the user pays rent")
    rent_amount: float = Field(default=18000.0, description="Monthly rent amount (0 if not paying rent)")
    other_fixed_bills: float = Field(default=4200.0, description="Other recurring bills (utilities, internet, EMIs)")
    savings_goal_type: str = Field(default="Emergency Fund", description="Goal category (Emergency Fund, Home, Car, Vacation, Wealth)")
    goal_name: str = Field(default="Emergency Reserve", description="Custom name for the financial goal")
    target_savings_per_month: float = Field(default=15000.0, description="Target amount to save each month")
    target_total_goal: float = Field(default=100000.0, description="Total target milestone amount")
    savings_timeline_months: int = Field(default=12, description="Target timeline in months")

class MilestoneProjection(BaseModel):
    month: int
    label: str
    total_saved: float
    goal_percentage: float
    milestone_hit: Optional[str] = None

class SavingsPlan(BaseModel):
    monthly_income: float
    rent_amount: float
    other_fixed_bills: float
    fixed_needs_total: float
    fixed_needs_percentage: float
    wants_allowance: float
    wants_percentage: float
    target_savings: float
    savings_percentage: float
    daily_discretionary_budget: float
    weekly_discretionary_budget: float
    months_to_target: int
    projected_timeline: List[MilestoneProjection]
    budget_breakdown: List[Dict[str, Any]]
    plan_status: str
    insights: List[str]

