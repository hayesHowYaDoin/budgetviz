<template>
  <div class="section">
    <h2>Budget Over Time</h2>
    <div class="chart-container" v-if="chartData.labels.length > 0">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <p v-else style="color: #6c757d; font-style: italic;">
      Configure your budget above to see the visualization.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js';
import type { BudgetDataPoint } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps<{
  balanceData: BudgetDataPoint[];
}>();

const chartData = computed(() => {
  if (!props.balanceData || props.balanceData.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }

  const labels = props.balanceData.map(point => {
    const date = new Date(point.date + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  });

  const data = props.balanceData.map(point => point.balance);

  return {
    labels,
    datasets: [
      {
        label: 'Budget Balance',
        data,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ]
  };
});

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += '$' + context.parsed.y.toFixed(2);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: function(value) {
          return '$' + value;
        }
      }
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
};
</script>
