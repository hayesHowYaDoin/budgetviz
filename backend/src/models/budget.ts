export interface Purchase {
  date: string; // ISO date format (YYYY-MM-DD)
  amount: number;
  description: string;
  enabled: boolean; // Whether this purchase is included in calculations
}

export interface Budget {
  name: string;
  initialValue: number;
  monthlyContribution: number;
  purchases: Purchase[];
}

export interface BudgetDataPoint {
  date: string;
  balance: number;
}

export interface SuggestedContribution {
  monthlyAmount: number;
  totalMonths: number;
  finalBalance: number;
}
