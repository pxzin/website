<!-- Category Breakdown Component -->
<script lang="ts">
  import { fly } from 'svelte/transition';

  export let categoryBreakdown: {
    [key: string]: { income: number; expenses: number };
  } = {};

  $: sortedCategories = Object.keys(categoryBreakdown).sort((a, b) => {
    const aTotal =
      Math.abs(categoryBreakdown[a].expenses) + categoryBreakdown[a].income;
    const bTotal =
      Math.abs(categoryBreakdown[b].expenses) + categoryBreakdown[b].income;
    return bTotal - aTotal;
  });
</script>

{#if sortedCategories.length > 0}
  <div
    class="bg-purple-50 border border-purple-200 rounded-lg p-6"
    in:fly={{ y: 20, duration: 400, delay: 500 }}
  >
    <h3 class="text-lg font-semibold text-purple-800 mb-4">
      📊 Category Breakdown
    </h3>
    <div class="space-y-3">
      {#each sortedCategories as category}
        {@const data = categoryBreakdown[category]}
        {@const totalActivity = Math.abs(data.expenses) + data.income}
        <div class="bg-white rounded-lg p-4 border border-purple-100">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-medium text-purple-800">{category}</h4>
            <span class="text-sm text-purple-600">
              Total: ${totalActivity.toFixed(2)}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            {#if data.income > 0}
              <div class="text-green-700">
                Income: +${data.income.toFixed(2)}
              </div>
            {/if}
            {#if data.expenses < 0}
              <div class="text-red-700">
                Expenses: -${Math.abs(data.expenses).toFixed(2)}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
