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
          <th style="width: 60px;">Enabled</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(purchase, index) in sortedPurchases"
          :key="index"
          :style="{ opacity: purchase.enabled ? 1 : 0.5 }"
        >
          <template v-if="editingIndex === index">
            <!-- Edit mode -->
            <td>
              <input
                type="checkbox"
                v-model="editingPurchase.enabled"
                style="cursor: pointer; width: 20px; height: 20px;"
              />
            </td>
            <td>
              <input
                type="date"
                v-model="editingPurchase.date"
                style="width: 150px;"
              />
            </td>
            <td>
              <input
                type="number"
                v-model.number="editingPurchase.amount"
                step="0.01"
                min="0"
                style="width: 100px;"
              />
            </td>
            <td>
              <input
                type="text"
                v-model="editingPurchase.description"
                style="width: 100%;"
              />
            </td>
            <td>
              <button @click="saveEdit(index)">Save</button>
              <button class="secondary" @click="cancelEdit">Cancel</button>
            </td>
          </template>
          <template v-else>
            <!-- View mode -->
            <td>
              <input
                type="checkbox"
                :checked="purchase.enabled"
                @change="toggleEnabled(index)"
                style="cursor: pointer; width: 20px; height: 20px;"
              />
            </td>
            <td :style="{ textDecoration: purchase.enabled ? 'none' : 'line-through' }">
              {{ formatDate(purchase.date) }}
            </td>
            <td :style="{ textDecoration: purchase.enabled ? 'none' : 'line-through' }">
              ${{ purchase.amount.toFixed(2) }}
            </td>
            <td :style="{ textDecoration: purchase.enabled ? 'none' : 'line-through' }">
              {{ purchase.description }}
            </td>
            <td>
              <button class="secondary" @click="startEdit(index)">Edit</button>
              <button class="danger" @click="removePurchase(index)">Delete</button>
            </td>
          </template>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2"><strong>Total (Enabled):</strong></td>
          <td><strong>${{ enabledTotalAmount.toFixed(2) }}</strong></td>
          <td colspan="2" style="color: #6c757d; font-size: 0.9rem;">
            {{ enabledCount }} of {{ purchases.length }} enabled
          </td>
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
  description: '',
  enabled: true
});

const editingIndex = ref<number | null>(null);
const editingPurchase = ref<Purchase | null>(null);

const sortedPurchases = computed(() => {
  return [...props.purchases].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
});

const enabledTotalAmount = computed(() => {
  return props.purchases
    .filter(p => p.enabled)
    .reduce((sum, p) => sum + p.amount, 0);
});

const enabledCount = computed(() => {
  return props.purchases.filter(p => p.enabled).length;
});

function addPurchase() {
  if (newPurchase.value.amount > 0 && newPurchase.value.date) {
    const updated = [...props.purchases, { ...newPurchase.value }];
    emit('update', updated);

    // Reset form
    newPurchase.value = {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      enabled: true
    };
  }
}

function toggleEnabled(index: number) {
  const sorted = sortedPurchases.value;
  const purchaseToToggle = sorted[index];
  const updated = props.purchases.map(p =>
    p === purchaseToToggle ? { ...p, enabled: !p.enabled } : p
  );
  emit('update', updated);
}

function startEdit(index: number) {
  editingIndex.value = index;
  editingPurchase.value = { ...sortedPurchases.value[index] };
}

function saveEdit(index: number) {
  if (editingPurchase.value) {
    const sorted = sortedPurchases.value;
    const purchaseToEdit = sorted[index];
    const updated = props.purchases.map(p =>
      p === purchaseToEdit ? { ...editingPurchase.value! } : p
    );
    emit('update', updated);
    cancelEdit();
  }
}

function cancelEdit() {
  editingIndex.value = null;
  editingPurchase.value = null;
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
