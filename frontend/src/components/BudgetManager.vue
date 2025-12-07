<template>
  <div class="section">
    <h2>Budget Management</h2>

    <div style="margin-bottom: 1.5rem;">
      <h3>Save / Load</h3>
      <button @click="handleSave" :disabled="!budget.name">
        Save Current Budget
      </button>
      <button class="secondary" @click="loadAvailableBudgets">
        Refresh Budget List
      </button>
      <button class="secondary" @click="handleNew">
        New Budget
      </button>
    </div>

    <div v-if="availableBudgets.length > 0" style="margin-bottom: 1.5rem;">
      <h3>Available Budgets</h3>
      <table>
        <thead>
          <tr>
            <th>Budget Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="budgetName in availableBudgets" :key="budgetName">
            <td>{{ budgetName }}</td>
            <td>
              <button class="secondary" @click="handleLoad(budgetName)">Load</button>
              <button class="danger" @click="handleDelete(budgetName)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="suggestion" style="margin-top: 1.5rem;">
      <h3>Suggested Monthly Contribution</h3>
      <div class="info-box">
        <p>
          <strong>Suggested Amount: ${{ suggestion.monthlyAmount.toFixed(2) }}/month</strong>
        </p>
        <p style="margin-top: 0.5rem;">
          With this contribution over {{ suggestion.totalMonths }} month(s),
          your final balance will be approximately ${{ suggestion.finalBalance.toFixed(2) }}
          after all planned purchases.
        </p>
        <button style="margin-top: 0.5rem;" @click="applySuggestion">
          Apply This Contribution
        </button>
      </div>
    </div>

    <div v-if="message" :class="messageType === 'error' ? 'warning-box' : 'info-box'" style="margin-top: 1rem;">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Budget, SuggestedContribution } from '../types';
import { listBudgets, loadBudget, saveBudget, deleteBudget } from '../services/api';

const props = defineProps<{
  budget: Budget;
  suggestion: SuggestedContribution | null;
}>();

const emit = defineEmits<{
  load: [budget: Budget];
  new: [];
  applySuggestion: [amount: number];
}>();

const availableBudgets = ref<string[]>([]);
const message = ref<string>('');
const messageType = ref<'info' | 'error'>('info');

onMounted(() => {
  loadAvailableBudgets();
});

async function loadAvailableBudgets() {
  try {
    availableBudgets.value = await listBudgets();
  } catch (error) {
    showMessage('Failed to load budget list', 'error');
  }
}

async function handleSave() {
  if (!props.budget.name) {
    showMessage('Please enter a budget name', 'error');
    return;
  }

  try {
    await saveBudget(props.budget);
    showMessage(`Budget "${props.budget.name}" saved successfully!`, 'info');
    await loadAvailableBudgets();
  } catch (error) {
    showMessage('Failed to save budget', 'error');
  }
}

async function handleLoad(budgetName: string) {
  try {
    const loadedBudget = await loadBudget(budgetName);
    emit('load', loadedBudget);
    showMessage(`Budget "${budgetName}" loaded successfully!`, 'info');
  } catch (error) {
    showMessage('Failed to load budget', 'error');
  }
}

async function handleDelete(budgetName: string) {
  if (!confirm(`Are you sure you want to delete budget "${budgetName}"?`)) {
    return;
  }

  try {
    await deleteBudget(budgetName);
    showMessage(`Budget "${budgetName}" deleted successfully!`, 'info');
    await loadAvailableBudgets();
  } catch (error) {
    showMessage('Failed to delete budget', 'error');
  }
}

function handleNew() {
  emit('new');
  showMessage('Started new budget', 'info');
}

function applySuggestion() {
  if (props.suggestion) {
    emit('applySuggestion', props.suggestion.monthlyAmount);
    showMessage('Applied suggested monthly contribution', 'info');
  }
}

function showMessage(msg: string, type: 'info' | 'error') {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 5000);
}
</script>
