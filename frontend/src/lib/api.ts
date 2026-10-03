import { 
  Transaction, 
  FinancialHealthScore, 
  SpendingForecast, 
  CopilotResponse, 
  ProactiveAlert, 
  AnalyticsSummary,
  ProjectPlan,
  ProjectPlanCreate,
  DailyExpenseEntry
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// In-memory mock fallback state for standalone frontend resilience
let mockTransactions: Transaction[] = [
  {
    id: "tx_101",
    user_id: "user_default",
    amount: 438,
    currency: "INR",
    merchant: "Swiggy",
    description: "Swiggy dinner order",
    category: "Food",
    subcategory: "Delivery",
    confidence: 0.94,
    is_anomaly: false,
    transaction_date: "2026-10-03",
    transaction_type: "expense",
    source: "natural_language",
    created_at: "2026-10-03T19:30:00Z"
  },
  {
    id: "tx_102",
    user_id: "user_default",
    amount: 216,
    currency: "INR",
    merchant: "Uber",
    description: "Uber ride to office",
    category: "Transportation",
    subcategory: "Cab",
    confidence: 0.92,
    is_anomaly: false,
    transaction_date: "2026-10-03",
    transaction_type: "expense",
    source: "manual",
    created_at: "2026-10-03T09:15:00Z"
  },
  {
    id: "tx_103",
    user_id: "user_default",
    amount: 1299,
    currency: "INR",
    merchant: "Amazon",
    description: "Amazon wireless earbuds",
    category: "Shopping",
    subcategory: "Electronics",
    confidence: 0.89,
    is_anomaly: false,
    transaction_date: "2026-10-02",
    transaction_type: "expense",
    source: "csv_upload",
    created_at: "2026-10-02T14:20:00Z"
  },
  {
    id: "tx_104",
    user_id: "user_default",
    amount: 450,
    currency: "INR",
    merchant: "Dinner with Friends",
    description: "Dinner with friends at cafe",
    category: "Food",
    subcategory: "Dining",
    confidence: 0.95,
    is_anomaly: false,
    transaction_date: "2026-10-02",
    transaction_type: "expense",
    source: "natural_language",
    created_at: "2026-10-02T21:00:00Z"
  },
  {
    id: "tx_105",
    user_id: "user_default",
    amount: 649,
    currency: "INR",
    merchant: "Netflix",
    description: "Netflix 4K subscription",
    category: "Entertainment",
    subcategory: "Streaming",
    confidence: 0.97,
    is_anomaly: false,
    transaction_date: "2026-10-01",
    transaction_type: "expense",
    source: "seed_data",
    created_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "tx_106",
    user_id: "user_default",
    amount: 18500,
    currency: "INR",
    merchant: "Croma Electronics",
    description: "Monitor and mechanical keyboard",
    category: "Shopping",
    subcategory: "Electronics",
    confidence: 0.91,
    is_anomaly: true,
    anomaly_reason: "Unusual activity: ₹18,500 is 3.7x higher than your typical Shopping spending baseline.",
    transaction_date: "2026-09-28",
    transaction_type: "expense",
    source: "seed_data",
    created_at: "2026-09-28T17:45:00Z"
  },
  {
    id: "tx_107",
    user_id: "user_default",
    amount: 65000,
    currency: "INR",
    merchant: "Acme Corp Payroll",
    description: "Monthly salary direct deposit",
    category: "Salary",
    subcategory: "Salary",
    confidence: 0.99,
    is_anomaly: false,
    transaction_date: "2026-10-01",
    transaction_type: "income",
    source: "seed_data",
    created_at: "2026-10-01T06:00:00Z"
  }
];

let mockAlerts: ProactiveAlert[] = [
  {
    id: "alert_food_surge",
    type: "surge",
    title: "🔔 Spending Alert",
    message: "You've spent ₹8,100 on Food this month. Your normal monthly average is ₹5,500 (+47.2% surge).",
    severity: "warning",
    timestamp: "Just now",
    action_label: "View Food Breakdown",
    action_type: "filter_food"
  },
  {
    id: "alert_subscription",
    type: "subscription",
    title: "💡 Subscription Detected",
    message: "We noticed a recurring ₹799 payment to XYZ App. You haven't recorded any related activity recently. Review subscription?",
    severity: "info",
    timestamp: "Yesterday",
    action_label: "Cancel / Review",
    action_type: "review_subscription"
  },
  {
    id: "alert_savings_milestone",
    type: "savings_win",
    title: "📈 Good Month",
    message: "You've saved ₹6,400 more than your 3-month baseline! At this pace, your emergency fund will reach ₹50,000 in ~4 months.",
    severity: "success",
    timestamp: "2 days ago",
    action_label: "Add to Emergency Fund",
    action_type: "open_savings_goal"
  }
];

export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch(`${API_BASE}/transactions`, { cache: 'no-store' });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return [...mockTransactions];
  }
}

export async function parseNaturalLanguageTransaction(text: string): Promise<Transaction> {
  try {
    const res = await fetch(`${API_BASE}/transactions/parse-nl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    mockTransactions.unshift(data);
    return data;
  } catch {
    // Client-side parser fallback
    const amountMatch = text.match(/(?:₹|rs\.?|\$)?\s*([0-9,]+)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 450;
    let category = "Food";
    let subcategory = "Dining";
    if (text.toLowerCase().includes("uber") || text.toLowerCase().includes("ola") || text.toLowerCase().includes("ride")) {
      category = "Transportation";
      subcategory = "Cab";
    } else if (text.toLowerCase().includes("amazon") || text.toLowerCase().includes("buy") || text.toLowerCase().includes("phone")) {
      category = "Shopping";
      subcategory = "Electronics";
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      user_id: "user_default",
      amount,
      currency: "INR",
      merchant: text.split(" ")[0] || "Custom Expense",
      description: text,
      category,
      subcategory,
      confidence: 0.93,
      is_anomaly: amount > 10000,
      anomaly_reason: amount > 10000 ? `Unusual activity: ₹${amount.toLocaleString()} is above normal baseline.` : null,
      transaction_date: new Date().toISOString().split("T")[0],
      transaction_type: "expense",
      source: "natural_language",
      created_at: new Date().toISOString()
    };
    mockTransactions.unshift(newTx);
    return newTx;
  }
}

export async function correctCategory(txId: string, correctedCategory: string): Promise<Transaction | null> {
  try {
    const res = await fetch(`${API_BASE}/transactions/correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: txId, corrected_category: correctedCategory })
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    const tx = mockTransactions.find(t => t.id === txId);
    if (tx) {
      tx.category = correctedCategory;
      tx.confidence = 1.0;
    }
    return tx || null;
  }
}

export async function fetchHealthScore(): Promise<FinancialHealthScore> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return {
      overall_score: 70,
      cash_flow_score: 81,
      savings_score: 63,
      spending_score: 72,
      debt_score: 84,
      consistency_score: 51,
      monthly_income: 65000,
      monthly_spending: 43200,
      expected_savings: 21800,
      days_until_salary: 12,
      expected_remaining_buffer: 8900,
      health_grade: "Strong (Discretionary Velocity Elevated)",
      indicators: [
        { label: "Monthly Income", value: "₹65,000", status: "positive" },
        { label: "Monthly Spending", value: "₹43,200", status: "neutral" },
        { label: "Expected Savings", value: "₹21,800", status: "positive" },
        { label: "Next Salary", value: "12 days", status: "info" },
        { label: "Expected Remaining Buffer", value: "₹8,900", status: "positive" }
      ],
      recommendations: [
        "Food spending surge (+46%) is lowering your Consistency and Savings pillars.",
        "Keeping discretionary expenses below ₹500/day for the next 12 days preserves your ₹8,900 buffer.",
        "Review recurring ₹799 subscription to reclaim ₹9,588 annually towards your emergency fund."
      ]
    };
  }
}

export async function fetchSpendingForecast(): Promise<SpendingForecast> {
  try {
    const res = await fetch(`${API_BASE}/forecast`, { cache: 'no-store' });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return {
      current_month_spent: 28450,
      predicted_month_end: 47200,
      historical_monthly_avg: 41800,
      velocity_percent: 12.9,
      remaining_days_in_month: 12,
      category_forecasts: [
        { category: "Food", spent_so_far: 8100, predicted_month_end: 9300, historical_baseline: 5500, deviation_percent: 69.1, status: "critical" },
        { category: "Housing", spent_so_far: 18000, predicted_month_end: 18000, historical_baseline: 18000, deviation_percent: 0.0, status: "normal" },
        { category: "Transportation", spent_so_far: 2400, predicted_month_end: 3200, historical_baseline: 3200, deviation_percent: 0.0, status: "normal" },
        { category: "Shopping", spent_so_far: 4900, predicted_month_end: 6200, historical_baseline: 6800, deviation_percent: -8.8, status: "optimal" },
        { category: "Utilities", spent_so_far: 3329, predicted_month_end: 4200, historical_baseline: 4200, deviation_percent: 0.0, status: "normal" },
        { category: "Entertainment", spent_so_far: 1498, predicted_month_end: 2100, historical_baseline: 2100, deviation_percent: 0.0, status: "normal" }
      ],
      insights: [
        "Food spending is currently ~40% above your historical pattern (Historical: ₹5,500 | Projected: ₹9,300).",
        "Overall spending velocity is +12.9% above monthly target. Expected end-of-month spend is ₹47,200."
      ]
    };
  }
}

export async function queryCopilot(query: string): Promise<CopilotResponse> {
  try {
    const res = await fetch(`${API_BASE}/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    // Deterministic simulation fallback
    const isAfford = query.toLowerCase().includes("afford") || query.toLowerCase().includes("phone") || query.toLowerCase().includes("buy");
    if (isAfford) {
      return {
        answer: "You currently have ₹31,500 available, but you have approximately ₹14,000 of expected expenses and obligations before your next salary in 12 days.\n\nA ₹20,000 purchase right now would reduce your projected buffer to approximately ₹-2,500, putting your account into a cash-flow deficit before payday.\n\n💡 **Recommended Strategy:** If you wait until your next salary (in 12 days), your projected buffer would be approximately ₹17,500 after completing the purchase and funding your savings goal.",
        intent: "affordability_assessment",
        calculations: {
          current_liquid_balance: 31500,
          monthly_income: 65000,
          fixed_expenses_remaining: 14000,
          discretionary_projected: 5000,
          savings_target: 10000,
          purchase_amount: 20000,
          projected_buffer_now: -2500,
          projected_buffer_wait_salary: 17500,
          can_afford_now: false
        },
        recommendation: "Defer the ₹20,000 purchase until salary day (12 days) to avoid a ₹2,500 cash crunch.",
        tools_called: [
          "fetch_liquid_balance",
          "calculate_upcoming_commitments",
          "simulate_cash_flow_impact",
          "project_post_salary_runway"
        ]
      };
    }

    return {
      answer: "Analyzing your financial profile:\n\n• Food spending is surging (+47.2% vs historical).\n• Fixed commitments are well covered.\n• Expected month-end savings buffer: ₹8,900.",
      intent: "general_analysis",
      recommendation: "Review discretionary deliveries on Swiggy & Zomato to restore optimal buffer.",
      tools_called: ["fetch_category_spending", "compute_historical_variance"]
    };
  }
}

export async function fetchAlerts(): Promise<ProactiveAlert[]> {
  try {
    const res = await fetch(`${API_BASE}/alerts`, { cache: 'no-store' });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return [...mockAlerts];
  }
}

export async function dismissAlert(id: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/alerts/${id}/dismiss`, { method: 'POST' });
  } catch {}
  mockAlerts = mockAlerts.filter(a => a.id !== id);
  return true;
}

let mockUserProfile = {
  monthly_income: 65000,
  pays_rent: true,
  rent_amount: 18000,
  other_fixed_bills: 4200,
  savings_goal_type: "Emergency Fund",
  goal_name: "Emergency Reserve",
  target_savings_per_month: 15000,
  target_total_goal: 100000,
  savings_timeline_months: 12
};

export async function fetchUserProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile`, { cache: 'no-store' });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return { ...mockUserProfile };
  }
}

export async function updateUserProfile(profile: any) {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error("API error");
    const plan = await res.json();
    mockUserProfile = { ...profile };
    return plan;
  } catch {
    mockUserProfile = { ...profile };
    return computeMockSavingsPlan(profile);
  }
}

export async function fetchSavingsPlan() {
  try {
    const res = await fetch(`${API_BASE}/profile/plan`, { cache: 'no-store' });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return computeMockSavingsPlan(mockUserProfile);
  }
}

function computeMockSavingsPlan(p: any) {
  const income = p.monthly_income || 65000;
  const rent = p.pays_rent ? (p.rent_amount || 0) : 0;
  const bills = p.other_fixed_bills || 4200;
  const baseLiving = 6000;
  const fixedNeeds = rent + bills + baseLiving;
  const targetSavings = p.target_savings_per_month || 15000;
  const wants = Math.max(0, income - fixedNeeds - targetSavings);
  const dailyBudget = Math.round((wants / 30) * 100) / 100;
  const weeklyBudget = Math.round(dailyBudget * 7 * 100) / 100;
  const totalGoal = p.target_total_goal || 100000;
  const monthsToTarget = targetSavings > 0 ? Math.ceil(totalGoal / targetSavings) : 12;

  const timeline = [1, 3, 6, 9, 12, 18, 24].map((m) => {
    const saved = m * targetSavings;
    let hit = null;
    if (saved >= totalGoal && (m - 1) * targetSavings < totalGoal) {
      hit = `🎯 ${p.goal_name || 'Goal'} Fully Achieved!`;
    } else if (m === 3 && saved >= 40000) {
      hit = "🛡️ 1-Month Living Runway Reached";
    } else if (m === 6 && saved >= 90000) {
      hit = "⭐ 3-Month Emergency Shield Complete";
    }
    return {
      month: m,
      label: `Month ${m}`,
      total_saved: saved,
      goal_percentage: Math.min(100, Math.round((saved / totalGoal) * 100)),
      milestone_hit: hit
    };
  });

  return {
    monthly_income: income,
    rent_amount: rent,
    other_fixed_bills: bills,
    fixed_needs_total: fixedNeeds,
    fixed_needs_percentage: Math.round((fixedNeeds / income) * 1000) / 10,
    wants_allowance: wants,
    wants_percentage: Math.round((wants / income) * 1000) / 10,
    target_savings: targetSavings,
    savings_percentage: Math.round((targetSavings / income) * 1000) / 10,
    daily_discretionary_budget: dailyBudget,
    weekly_discretionary_budget: weeklyBudget,
    months_to_target: monthsToTarget,
    projected_timeline: timeline,
    budget_breakdown: [
      { category: "Essential Needs", amount: fixedNeeds, percentage: Math.round((fixedNeeds / income) * 100), color: "emerald", items: `Rent (₹${rent.toLocaleString()}) + Bills (₹${bills.toLocaleString()}) + Staples (₹${baseLiving.toLocaleString()})` },
      { category: "Savings Target", amount: targetSavings, percentage: Math.round((targetSavings / income) * 100), color: "cyan", items: `${p.goal_name || 'Goal'} @ ₹${targetSavings.toLocaleString()}/mo` },
      { category: "Discretionary Wants", amount: wants, percentage: Math.round((wants / income) * 100), color: "amber", items: `Dining, shopping, leisure (₹${dailyBudget.toLocaleString()}/day)` }
    ],
    plan_status: "Optimal",
    insights: [
      p.pays_rent ? `Housing rent consumes ${Math.round((rent / income) * 100)}% of your take-home pay.` : "Zero rent obligation allows maximum wealth accumulation.",
      `At ₹${targetSavings.toLocaleString()}/mo, you will achieve your full ₹${totalGoal.toLocaleString()} ${p.goal_name || 'goal'} in approx ${monthsToTarget} months.`,
      `To protect your target, keep daily discretionary spending below ₹${dailyBudget.toLocaleString()}/day.`
    ]
  };
}

// -------------------------------------------------------------
// PROJECT PLANNER & DYNAMIC RE-BALANCER API METHODS
// -------------------------------------------------------------

let mockProjectPlan: ProjectPlan | null = null;

function initMockProject(): ProjectPlan {
  const income = 65000;
  const rent = 18000;
  const bills = 4200;
  const staples = 6000;
  const targetSavings = 15000;
  const fixedNeeds = rent + bills + staples;
  const wants = Math.max(0, income - fixedNeeds - targetSavings);
  const baseDailyCap = Math.round((wants / 30) * 100) / 100;

  const sampleSpends: Record<number, number> = { 1: 520, 2: 640, 3: 1100 };
  const daysData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const spent = sampleSpends[day] || 0;
    const overspent = spent > baseDailyCap ? Math.round((spent - baseDailyCap) * 100) / 100 : 0;
    const status: 'within_budget' | 'overspent' | 'upcoming' = 
      spent > 0 ? (spent > baseDailyCap ? 'overspent' : 'within_budget') : 'upcoming';

    return {
      day,
      date_label: `Day ${day}`,
      expense_cap: baseDailyCap,
      actual_spent: spent,
      status,
      overspent_amount: overspent
    };
  });

  const totalSpent = daysData.reduce((acc, d) => acc + (d.actual_spent > 0 ? d.actual_spent : 0), 0);
  const totalOverspent = daysData.reduce((acc, d) => acc + d.overspent_amount, 0);
  const remainingDays = daysData.filter(d => d.actual_spent === 0).length;
  const remainingPool = Math.max(0, wants - totalSpent);
  const currentDailyCap = remainingDays > 0 ? Math.round((remainingPool / remainingDays) * 100) / 100 : 0;

  daysData.forEach(d => {
    if (d.actual_spent === 0) d.expense_cap = currentDailyCap;
  });

  const futureProjections = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    month_name: `Month ${i + 1}`,
    target_savings: targetSavings,
    cumulative_saved: (i + 1) * targetSavings,
    monthly_expense_cap: wants,
    status: 'on_track' as const
  }));

  return {
    id: "proj_blueprint_primary",
    project_name: "Financial Freedom Blueprint",
    monthly_income: income,
    rent_amount: rent,
    other_fixed_bills: bills,
    fixed_needs_total: fixedNeeds,
    target_monthly_savings: targetSavings,
    target_total_milestone: 100000,
    total_months: 12,
    wants_monthly_pool: wants,
    base_daily_allowance: baseDailyCap,
    current_daily_allowance: currentDailyCap,
    total_spent_this_month: totalSpent,
    total_overspent_this_month: totalOverspent,
    remaining_days_in_month: remainingDays,
    days_data: daysData,
    next_month_adjusted_target: targetSavings,
    future_months_projections: futureProjections,
    rebalancing_message: "Day 3 overspent by ₹373.33. Project updated in-place: Remaining days' allowance re-balanced to preserve ₹15,000 savings goal.",
    status: "active"
  };
}

export async function fetchProject(): Promise<ProjectPlan> {
  try {
    const res = await fetch(`${API_BASE}/project`, { cache: 'no-store' });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    mockProjectPlan = data;
    return data;
  } catch {
    if (!mockProjectPlan) {
      mockProjectPlan = initMockProject();
    }
    return mockProjectPlan;
  }
}

export async function createProject(params: ProjectPlanCreate): Promise<ProjectPlan> {
  try {
    const res = await fetch(`${API_BASE}/project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    mockProjectPlan = data;
    return data;
  } catch {
    const income = params.monthly_income;
    const rent = params.pays_rent ? params.rent_amount : 0;
    const bills = params.other_fixed_bills;
    const staples = 6000;
    const fixedNeeds = rent + bills + staples;
    const targetSavings = params.target_monthly_savings;
    const wants = Math.max(0, income - fixedNeeds - targetSavings);
    const dailyCap = Math.round((wants / 30) * 100) / 100;

    const daysData = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      date_label: `Day ${i + 1}`,
      expense_cap: dailyCap,
      actual_spent: 0,
      status: 'upcoming' as const,
      overspent_amount: 0
    }));

    const futureProjections = Array.from({ length: params.total_months }, (_, i) => ({
      month: i + 1,
      month_name: `Month ${i + 1}`,
      target_savings: targetSavings,
      cumulative_saved: (i + 1) * targetSavings,
      monthly_expense_cap: wants,
      status: 'on_track' as const
    }));

    mockProjectPlan = {
      id: `proj_${Date.now()}`,
      project_name: params.project_name || "My Financial Blueprint",
      monthly_income: income,
      rent_amount: rent,
      other_fixed_bills: bills,
      fixed_needs_total: fixedNeeds,
      target_monthly_savings: targetSavings,
      target_total_milestone: params.target_total_milestone,
      total_months: params.total_months,
      wants_monthly_pool: wants,
      base_daily_allowance: dailyCap,
      current_daily_allowance: dailyCap,
      total_spent_this_month: 0,
      total_overspent_this_month: 0,
      remaining_days_in_month: 30,
      days_data: daysData,
      next_month_adjusted_target: targetSavings,
      future_months_projections: futureProjections,
      rebalancing_message: `Project '${params.project_name}' created from scratch. Daily allowance set to ₹${dailyCap.toLocaleString()}/day.`,
      status: "active"
    };
    return mockProjectPlan;
  }
}

export async function logDailyExpense(day: number, amount: number, note?: string): Promise<ProjectPlan> {
  try {
    const res = await fetch(`${API_BASE}/project/log-daily-spend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day, amount, note: note || "Daily expense" })
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    mockProjectPlan = data;
    return data;
  } catch {
    if (!mockProjectPlan) {
      mockProjectPlan = initMockProject();
    }
    const plan = mockProjectPlan;
    const targetDay = plan.days_data.find(d => d.day === day);
    if (targetDay) {
      const cap = targetDay.expense_cap;
      targetDay.actual_spent = amount;
      if (amount > cap) {
        targetDay.status = 'overspent';
        targetDay.overspent_amount = Math.round((amount - cap) * 100) / 100;
      } else {
        targetDay.status = 'within_budget';
        targetDay.overspent_amount = 0;
      }
    }

    const totalSpent = plan.days_data.reduce((acc, d) => acc + (d.actual_spent > 0 ? d.actual_spent : 0), 0);
    const totalOverspent = plan.days_data.reduce((acc, d) => acc + d.overspent_amount, 0);
    const upcoming = plan.days_data.filter(d => d.actual_spent === 0 && d.day > day);
    const remainingCount = upcoming.length;
    const remainingPool = plan.wants_monthly_pool - totalSpent;

    let rebalanceMsg = "";
    let nextTarget = plan.target_monthly_savings;

    if (remainingCount > 0) {
      if (remainingPool > 0) {
        const newCap = Math.round((remainingPool / remainingCount) * 100) / 100;
        upcoming.forEach(d => { d.expense_cap = newCap; });
        plan.current_daily_allowance = newCap;
        plan.next_month_adjusted_target = plan.target_monthly_savings;
        const targetDayCap = targetDay ? targetDay.expense_cap : plan.base_daily_allowance;
        if (amount > targetDayCap) {
          rebalanceMsg = `⚡ Day ${day} overspent by ₹${Math.round(amount - targetDayCap).toLocaleString()}. Project updated in-place: Daily cap for remaining ${remainingCount} days adjusted to ₹${newCap.toLocaleString()}/day to safeguard your ₹${plan.target_monthly_savings.toLocaleString()} savings goal.`;
        } else {
          rebalanceMsg = `✅ Day ${day} expense of ₹${amount.toLocaleString()} is within cap. Daily cap for remaining ${remainingCount} days is ₹${newCap.toLocaleString()}/day.`;
        }
      } else {
        const deficit = Math.abs(remainingPool);
        upcoming.forEach(d => { d.expense_cap = 0; });
        plan.current_daily_allowance = 0;
        nextTarget = plan.target_monthly_savings + deficit;
        plan.next_month_adjusted_target = nextTarget;
        rebalanceMsg = `⚠️ Day ${day} expense caused a net monthly overspend of ₹${Math.round(deficit).toLocaleString()}! Project updated in-place: Remaining days cap set to ₹0. Future month savings target rebalanced to ₹${Math.round(nextTarget).toLocaleString()} to absorb deficit.`;
      }
    }

    plan.total_spent_this_month = totalSpent;
    plan.total_overspent_this_month = totalOverspent;
    plan.remaining_days_in_month = remainingCount;
    plan.rebalancing_message = rebalanceMsg;

    if (plan.future_months_projections && plan.future_months_projections.length > 1) {
      if (nextTarget > plan.target_monthly_savings) {
        plan.future_months_projections[1].target_savings = nextTarget;
        plan.future_months_projections[1].status = 'rebalanced_recovery';
        plan.future_months_projections[1].monthly_expense_cap = Math.max(0, plan.wants_monthly_pool - (nextTarget - plan.target_monthly_savings));
      } else {
        plan.future_months_projections[1].target_savings = plan.target_monthly_savings;
        plan.future_months_projections[1].status = 'on_track';
        plan.future_months_projections[1].monthly_expense_cap = plan.wants_monthly_pool;
      }
    }

    mockProjectPlan = { ...plan };
    return mockProjectPlan;
  }
}

export async function resetProject(): Promise<ProjectPlan> {
  try {
    const res = await fetch(`${API_BASE}/project/reset`, { method: 'POST' });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    mockProjectPlan = data;
    return data;
  } catch {
    mockProjectPlan = initMockProject();
    return mockProjectPlan;
  }
}

