<template>
  <div class="section">
    <h2>Planned Purchases</h2>

    <div style="margin-bottom: 1rem;">
      <div class="form-group" style="display: inline-block; width: 200px; margin-right: 1rem;">
        <label for="newDate">Date:</label>
        <input id="newDate" type="date" v-model="newPurchase.date" />
      </div>
      <div class="form-group" style="display: inline-block; width: 150px; margin-right: 1rem;">
        <label for="newAmount">Amount ($):</label>
        <input
          id="newAmount"
          type="number"
          v-model.number="newPurchase.amount"
          step="0.01"
          min="0"
        />
      </div>
      <div class="form-group" style="display: inline-block; width: 300px; margin-right: 1rem;">
        <label for="newDescription">Description:</label>
        <input
          id="newDescription"
          type="text"
          v-model="newPurchase.description"
          placeholder="Item description"
        />
      </div>
      <div style="display: inline-block; vertical-align: bottom;">
        <button @click="addPurchase">Add Purchase</button>
      </div>
    </div>

    <table v-if="purchases.length > 0">
      <thead>
        <tr>
          <th>Date</th>
          <th>Amount</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(purchase, index) in sortedPurchases" :key="index">
          <td>{{ formatDate(purchase.date) }}</td>
          <td>${{ purchase.amount.toFixed(2) }}</td>
          <td>{{ purchase.description }}</td>
          <td>
            <button class="danger" @click="removePurchase(index)">Remove</button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td><strong>Total:</strong></td>
          <td><strong>${{ totalAmount.toFixed(2) }}</strong></td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>

    <p v-else style="color: #6c757d; font-style: italic;">
      No purchases added yet. Add a purchase above to get started.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Purchase } from '../types';

const props = defineProps<{
  purchases: Purchase[];
}>();

const emit = defineEmits<{
  update: [purchases: Purchase[]];
}>();

const newPurchase = ref<Purchase>({
  date: new Date().toISOString().split('T')[0],
  amount: 0,
  description: ''
});

const sortedPurchases = computed(() => {
  return [...props.purchases].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
});

const totalAmount = computed(() => {
  return props.purchases.reduce((sum, p) => sum + p.amount, 0);
});

function addPurchase() {
  if (newPurchase.value.amount > 0 && newPurchase.value.date) {
    const updated = [...props.purchases, { ...newPurchase.value }];
    emit('update', updated);

    // Reset form
    newPurchase.value = {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: ''
    };
  }
}

function removePurchase(index: number) {
  const sorted = sortedPurchases.value;
  const purchaseToRemove = sorted[index];
  const updated = props.purchases.filter(p => p !== purchaseToRemove);
  emit('update', updated);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>
