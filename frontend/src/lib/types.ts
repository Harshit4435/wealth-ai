export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  merchant: string;
  description: string;
  category: string;
  subcategory: string;
  confidence: number;
  is_anomaly: boolean;
  anomaly_reason?: string | null;
  transaction_date: string;
  transaction_type: 'expense' | 'income';
  source: string;
  created_at: string;
}

export interface Indicator {
  label: string;
  value: string;
  status: 'positive' | 'neutral' | 'warning' | 'info';
}

export interface FinancialHealthScore {
  overall_score: number;
  cash_flow_score: number;
  savings_score: number;
  spending_score: number;
  debt_score: number;
  consistency_score: number;
  monthly_income: number;
  monthly_spending: number;
  expected_savings: number;
  days_until_salary: number;
  expected_remaining_buffer: number;
  health_grade: string;
  indicators: Indicator[];
  recommendations: string[];
}

export interface CategoryForecast {
  category: string;
  spent_so_far: number;
  predicted_month_end: number;
  historical_baseline: number;
  deviation_percent: number;
  status: 'normal' | 'elevated' | 'critical' | 'optimal';
}

export interface SpendingForecast {
  current_month_spent: number;
  predicted_month_end: number;
  historical_monthly_avg: number;
  velocity_percent: number;
  remaining_days_in_month: number;
  category_forecasts: CategoryForecast[];
  insights: string[];
}

export interface CopilotCalculationDetails {
  current_liquid_balance: number;
  monthly_income: number;
  fixed_expenses_remaining: number;
  discretionary_projected: number;
  savings_target: number;
  purchase_amount: number;
  projected_buffer_now: number;
  projected_buffer_wait_salary: number;
  can_afford_now: boolean;
}

export interface CopilotResponse {
  answer: string;
  intent: string;
  calculations?: CopilotCalculationDetails;
  recommendation: string;
  tools_called: string[];
}

export interface ProactiveAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  action_label?: string;
  action_type?: string;
}

export interface AnalyticsSummary {
  total_income: number;
  total_expense: number;
  net_savings: number;
  monthly_trends: { month: string; spending: number; category_food: number }[];
  category_breakdown: { category: string; total_amount: number; percentage: number }[];
  total_transactions: number;
}

export interface UserProfile {
  monthly_income: number;
  pays_rent: boolean;
  rent_amount: number;
  other_fixed_bills: number;
  savings_goal_type: string;
  goal_name: string;
  target_savings_per_month: number;
  target_total_goal: number;
  savings_timeline_months: number;
}

export interface MilestoneProjection {
  month: number;
  label: string;
  total_saved: number;
  goal_percentage: number;
  milestone_hit?: string | null;
}

export interface BudgetBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  items: string;
}

export interface SavingsPlan {
  monthly_income: number;
  rent_amount: number;
  other_fixed_bills: number;
  fixed_needs_total: number;
  fixed_needs_percentage: number;
  wants_allowance: number;
  wants_percentage: number;
  target_savings: number;
  savings_percentage: number;
  daily_discretionary_budget: number;
  weekly_discretionary_budget: number;
  months_to_target: number;
  projected_timeline: MilestoneProjection[];
  budget_breakdown: BudgetBreakdownItem[];
  plan_status: string;
  insights: string[];
}

export interface DailyDayRecord {
  day: number;
  date_label: string;
  expense_cap: number;
  actual_spent: number;
  status: 'within_budget' | 'overspent' | 'upcoming';
  overspent_amount: number;
}

export interface DailyExpenseEntry {
  day: number;
  amount: number;
  note?: string;
}

export interface ProjectPlanCreate {
  project_name: string;
  monthly_income: number;
  pays_rent: boolean;
  rent_amount: number;
  other_fixed_bills: number;
  target_monthly_savings: number;
  target_total_milestone: number;
  total_months: number;
}

export interface FutureMonthProjection {
  month: number;
  month_name: string;
  target_savings: number;
  cumulative_saved: number;
  monthly_expense_cap: number;
  status: 'on_track' | 'rebalanced_recovery' | 'completed';
}

export interface ProjectPlan {
  id: string;
  project_name: string;
  monthly_income: number;
  rent_amount: number;
  other_fixed_bills: number;
  fixed_needs_total: number;
  target_monthly_savings: number;
  target_total_milestone: number;
  total_months: number;
  wants_monthly_pool: number;
  base_daily_allowance: number;
  current_daily_allowance: number;
  total_spent_this_month: number;
  total_overspent_this_month: number;
  remaining_days_in_month: number;
  days_data: DailyDayRecord[];
  next_month_adjusted_target: number;
  future_months_projections: FutureMonthProjection[];
  rebalancing_message?: string | null;
  status: string;
}

