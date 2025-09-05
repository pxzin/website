<!-- Financial Insights Component -->
<script lang="ts">
  import { fly } from 'svelte/transition';

  export let insights: any[] = [];
</script>

{#if insights.length > 0}
  <div
    class="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
    in:fly={{ y: 20, duration: 400, delay: 400 }}
  >
    <h3 class="text-lg font-semibold text-yellow-800 mb-4">
      📊 Financial Insights
    </h3>
    <div class="space-y-3">
      {#each insights as insight}
        <div
          class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-yellow-100"
        >
          <div class="text-xl">{insight.icon}</div>
          <div>
            <p class="text-sm font-medium text-yellow-800">
              {insight.title}
            </p>
            <p class="text-xs text-yellow-700 mt-1">
              {insight.description}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
