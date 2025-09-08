<!-- Monthly Stats Cards Component -->
<script lang="ts">
  import { fly } from 'svelte/transition';

  export let actualIncome: number;
  export let actualExpenses: number;
  export let netFlow: number;
  export let currentProjection: any = null;
  export let expensesIncurred: number = 0;
  export let cashFlowImpact: number = 0;
  export let creditCardExpenses: number = 0;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Actual Income -->
  <div
    class="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
    in:fly={{ y: 20, duration: 400, delay: 100 }}
  >
    <div class="text-2xl mb-2">💰</div>
    <h3
      class="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1"
    >
      Actual Income
    </h3>
    <p class="text-2xl font-bold text-green-800">
      +${actualIncome.toFixed(2)}
    </p>
    {#if currentProjection}
      <p class="text-xs text-green-600 mt-1">
        of ${currentProjection.total_income.toFixed(2)} projected
      </p>
    {/if}
  </div>

  <!-- Expenses Incurred (Total) -->
  <div
    class="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
    in:fly={{ y: 20, duration: 400, delay: 200 }}
  >
    <div class="text-2xl mb-2">💸</div>
    <h3 class="text-sm font-semibold text-red-700 uppercase tracking-wide mb-1">
      Expenses Incurred
    </h3>
    <p class="text-2xl font-bold text-red-800">
      -${expensesIncurred.toFixed(2)}
    </p>
    {#if currentProjection}
      <p class="text-xs text-red-600 mt-1">
        of ${currentProjection.total_expenses.toFixed(2)} projected
      </p>
    {/if}
    {#if creditCardExpenses > 0}
      <p class="text-xs text-orange-600 mt-1">
        💳 ${creditCardExpenses.toFixed(2)} on credit cards
      </p>
    {/if}
  </div>

  <!-- Cash Flow Impact -->
  <div
    class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center"
    in:fly={{ y: 20, duration: 400, delay: 250 }}
  >
    <div class="text-2xl mb-2">💳</div>
    <h3
      class="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-1"
    >
      Cash Flow Impact
    </h3>
    <p class="text-2xl font-bold text-orange-800">
      -${cashFlowImpact.toFixed(2)}
    </p>
    <p class="text-xs text-orange-600 mt-1">Excluding credit card expenses</p>
  </div>

  <!-- Net Flow -->
  <div
    class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
    in:fly={{ y: 20, duration: 400, delay: 300 }}
  >
    <div class="text-2xl mb-2">
      {#if netFlow >= 0}
        📈
      {:else}
        📉
      {/if}
    </div>
    <h3
      class="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-1"
    >
      Net Flow
    </h3>
    <p
      class="text-2xl font-bold"
      class:text-green-800={netFlow >= 0}
      class:text-red-800={netFlow < 0}
    >
      {#if netFlow >= 0}
        +${netFlow.toFixed(2)}
      {:else}
        -${Math.abs(netFlow).toFixed(2)}
      {/if}
    </p>
    {#if currentProjection}
      <p class="text-xs text-gray-600 mt-1">
        vs ${(
          currentProjection.total_income - currentProjection.total_expenses
        ).toFixed(2)} projected
      </p>
    {/if}
  </div>
</div>
