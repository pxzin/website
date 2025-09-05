<!-- Monthly Stats Cards Component -->
<script lang="ts">
  import { fly } from 'svelte/transition';

  export let actualIncome: number;
  export let actualExpenses: number;
  export let netFlow: number;
  export let currentProjection: any = null;
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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

  <!-- Actual Expenses -->
  <div
    class="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
    in:fly={{ y: 20, duration: 400, delay: 200 }}
  >
    <div class="text-2xl mb-2">💸</div>
    <h3 class="text-sm font-semibold text-red-700 uppercase tracking-wide mb-1">
      Actual Expenses
    </h3>
    <p class="text-2xl font-bold text-red-800">
      -${Math.abs(actualExpenses).toFixed(2)}
    </p>
    {#if currentProjection}
      <p class="text-xs text-red-600 mt-1">
        of ${currentProjection.total_expenses.toFixed(2)} projected
      </p>
    {/if}
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
