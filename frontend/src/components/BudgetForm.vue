<template>
  <div class="section">
    <h2>Budget Configuration</h2>
    <div class="form-group">
      <label for="budgetName">Budget Name:</label>
      <input
        id="budgetName"
        type="text"
        v-model="localBudget.name"
        @input="emitUpdate"
        placeholder="My Budget"
      />
    </div>
    <div class="form-group">
      <label for="initialValue">Initial Value ($):</label>
      <input
        id="initialValue"
        type="number"
        v-model.number="localBudget.initialValue"
        @input="emitUpdate"
        step="0.01"
        min="0"
      />
    </div>
    <div class="form-group">
      <label for="monthlyContribution">Monthly Contribution ($):</label>
      <input
        id="monthlyContribution"
        type="number"
        v-model.number="localBudget.monthlyContribution"
        @input="emitUpdate"
        step="0.01"
        min="0"
      />
      <small style="color: #6c757d; display: block; margin-top: 0.25rem;">
        Applied at the end of each month
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Budget } from '../types';

const props = defineProps<{
  budget: Budget;
}>();

const emit = defineEmits<{
  update: [budget: Budget];
}>();

const localBudget = reactive<Budget>({ ...props.budget });

// Watch for external changes to the budget prop
watch(() => props.budget, (newBudget) => {
  Object.assign(localBudget, newBudget);
}, { deep: true });

function emitUpdate() {
  emit('update', { ...localBudget });
}
</script>
