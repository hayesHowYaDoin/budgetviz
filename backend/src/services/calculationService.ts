import { Budget, Purchase, BudgetDataPoint, SuggestedContribution } from '../models/budget';

/**
 * Get the last day of a month
 */
function getEndOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/**
 * Calculate budget balance over time
 * Monthly contributions are applied at the end of each month
 */
export function calculateBalanceOverTime(budget: Budget): BudgetDataPoint[] {
  const dataPoints: BudgetDataPoint[] = [];

  if (budget.purchases.length === 0) {
    // If no purchases, just show initial value and a few months of contributions
    const today = new Date();
    let balance = budget.initialValue;

    dataPoints.push({
      date: today.toISOString().split('T')[0],
      balance: balance
    });

    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 0);
      balance += budget.monthlyContribution;
      dataPoints.push({
        date: futureDate.toISOString().split('T')[0],
        balance: balance
      });
    }

    return dataPoints;
  }

  // Sort purchases by date
  const sortedPurchases = [...budget.purchases].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Find date range
  const today = new Date();
  const firstPurchaseDate = new Date(sortedPurchases[0].date);
  const lastPurchaseDate = new Date(sortedPurchases[sortedPurchases.length - 1].date);

  const startDate = new Date(Math.min(today.getTime(), firstPurchaseDate.getTime()));
  const endDate = new Date(Math.max(lastPurchaseDate.getTime(), today.getTime()));

  // Add a few months buffer after the last purchase
  endDate.setMonth(endDate.getMonth() + 3);

  let balance = budget.initialValue;
  let currentDate = new Date(startDate);
  let purchaseIndex = 0;

  // Add initial data point
  dataPoints.push({
    date: currentDate.toISOString().split('T')[0],
    balance: balance
  });

  // Process day by day
  while (currentDate <= endDate) {
    // Check for purchases on this day
    while (purchaseIndex < sortedPurchases.length) {
      const purchaseDate = new Date(sortedPurchases[purchaseIndex].date);
      const currentDateStr = currentDate.toISOString().split('T')[0];
      const purchaseDateStr = purchaseDate.toISOString().split('T')[0];

      if (purchaseDateStr === currentDateStr) {
        balance -= sortedPurchases[purchaseIndex].amount;
        dataPoints.push({
          date: currentDateStr,
          balance: balance
        });
        purchaseIndex++;
      } else if (purchaseDate > currentDate) {
        break;
      } else {
        purchaseIndex++;
      }
    }

    // Check if we're at end of month
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    if (nextDay.getMonth() !== currentDate.getMonth()) {
      // End of month - add contribution
      balance += budget.monthlyContribution;
      dataPoints.push({
        date: currentDate.toISOString().split('T')[0],
        balance: balance
      });
    }

    currentDate = nextDay;
  }

  return dataPoints;
}

/**
 * Calculate suggested monthly contribution to reach zero balance after all purchases
 */
export function calculateSuggestedContribution(budget: Budget): SuggestedContribution {
  if (budget.purchases.length === 0) {
    return {
      monthlyAmount: 0,
      totalMonths: 0,
      finalBalance: budget.initialValue
    };
  }

  // Sort purchases by date
  const sortedPurchases = [...budget.purchases].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const today = new Date();
  const lastPurchaseDate = new Date(sortedPurchases[sortedPurchases.length - 1].date);

  // Calculate total purchase amount
  const totalPurchases = sortedPurchases.reduce((sum, p) => sum + p.amount, 0);

  // Calculate number of months from now to last purchase
  const monthsDiff = (lastPurchaseDate.getFullYear() - today.getFullYear()) * 12 +
                     (lastPurchaseDate.getMonth() - today.getMonth());

  const totalMonths = Math.max(1, monthsDiff + 1); // Include the month of the last purchase

  // Calculate required monthly contribution
  // We need: initialValue + (monthlyContribution * totalMonths) - totalPurchases = 0
  // So: monthlyContribution = (totalPurchases - initialValue) / totalMonths
  const requiredMonthlyContribution = (totalPurchases - budget.initialValue) / totalMonths;

  // Calculate what the final balance would be with this contribution
  const finalBalance = budget.initialValue + (requiredMonthlyContribution * totalMonths) - totalPurchases;

  return {
    monthlyAmount: Math.max(0, requiredMonthlyContribution), // Don't suggest negative contributions
    totalMonths: totalMonths,
    finalBalance: finalBalance
  };
}
