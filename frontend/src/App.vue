<template>
  <div>
    <h1>Budget Visualizer</h1>

    <BudgetForm :budget="budget" @update="updateBudget" />

    <PurchaseTable :purchases="budget.purchases" @update="updatePurchases" />

    <BudgetChart :balance-data="balanceData" />

    <BudgetManager
      :budget="budget"
      :suggestion="suggestion"
      @load="loadBudget"
      @new="createNewBudget"
      @apply-suggestion="applyMonthlyContribution"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BudgetForm from './components/BudgetForm.vue';
import PurchaseTable from './components/PurchaseTable.vue';
import BudgetChart from './components/BudgetChart.vue';
import BudgetManager from './components/BudgetManager.vue';
import type { Budget, BudgetDataPoint, SuggestedContribution, Purchase } from './types';
import { calculateBalance, suggestContribution } from './services/api';

const budget = ref<Budget>({
  name: '',
  initialValue: 0,
  monthlyContribution: 0,
  purchases: []
});

const balanceData = ref<BudgetDataPoint[]>([]);
const suggestion = ref<SuggestedContribution | null>(null);

// Watch for changes to budget and recalculate
watch(budget, async () => {
  await recalculate();
}, { deep: true });

async function recalculate() {
  try {
    // Calculate balance over time
    balanceData.value = await calculateBalance(budget.value);

    // Calculate suggested contribution
    if (budget.value.purchases.length > 0) {
      suggestion.value = await suggestContribution(budget.value);
    } else {
      suggestion.value = null;
    }
  } catch (error) {
    console.error('Failed to recalculate:', error);
  }
}

function updateBudget(updatedBudget: Budget) {
  budget.value = updatedBudget;
}

function updatePurchases(purchases: Purchase[]) {
  budget.value.purchases = purchases;
}

function loadBudget(loadedBudget: Budget) {
  budget.value = loadedBudget;
}

function createNewBudget() {
  budget.value = {
    name: '',
    initialValue: 0,
    monthlyContribution: 0,
    purchases: []
  };
  balanceData.value = [];
  suggestion.value = null;
}

function applyMonthlyContribution(amount: number) {
  budget.value.monthlyContribution = amount;
}

// Initial calculation
recalculate();
</script>
