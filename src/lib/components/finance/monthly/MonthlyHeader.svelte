<!-- Monthly Header Component -->
<script lang="ts">
  import { getCurrentMonthInfo } from '$lib/helpers/monthlyCalculations';

  export let totalBalance: number;
  export let transactions: any[] = [];
  export let monthProgress: number;
  export let remainingDays: number;

  const { currentMonth, currentYear } = getCurrentMonthInfo();
</script>

<div
  class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl"
>
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-3xl font-bold">{currentMonth} {currentYear}</h2>
      <p class="text-blue-100 text-lg">Current Financial Overview</p>
    </div>
    <div class="text-right">
      <div class="text-4xl font-bold">
        ${totalBalance.toFixed(2)}
      </div>
      <div class="text-sm text-blue-200">Total Balance</div>
    </div>
  </div>

  <!-- Show if no data is available -->
  {#if transactions.length === 0}
    <div class="mt-4 bg-blue-800/20 rounded-lg p-4 text-center">
      <div class="text-blue-200 text-sm">
        📊 No financial data available yet. Start by adding accounts,
        categories, and transactions!
      </div>
    </div>
  {/if}

  <!-- Month progress bar -->
  <div class="mt-4">
    <div class="flex justify-between text-sm text-blue-200 mb-2">
      <span>Month Progress</span>
      <span>{remainingDays} days remaining</span>
    </div>
    <div class="w-full bg-blue-800/30 rounded-full h-3">
      <div
        class="bg-white h-3 rounded-full transition-all duration-500"
        style="width: {monthProgress}%"
      ></div>
    </div>
  </div>
</div>
