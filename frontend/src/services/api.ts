import { Budget, BudgetDataPoint, SuggestedContribution } from '../types';

const API_BASE = '/api/budgets';

export async function listBudgets(): Promise<string[]> {
  const response = await fetch(API_BASE);
  const data = await response.json();
  return data.budgets;
}

export async function loadBudget(name: string): Promise<Budget> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error('Failed to load budget');
  }
  return response.json();
}

export async function saveBudget(budget: Budget): Promise<void> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget)
  });
  if (!response.ok) {
    throw new Error('Failed to save budget');
  }
}

export async function deleteBudget(name: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(name)}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete budget');
  }
}

export async function calculateBalance(budget: Budget): Promise<BudgetDataPoint[]> {
  const response = await fetch(`${API_BASE}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget)
  });
  if (!response.ok) {
    throw new Error('Failed to calculate balance');
  }
  const data = await response.json();
  return data.balanceData;
}

export async function suggestContribution(budget: Budget): Promise<SuggestedContribution> {
  const response = await fetch(`${API_BASE}/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget)
  });
  if (!response.ok) {
    throw new Error('Failed to calculate suggestion');
  }
  return response.json();
}
