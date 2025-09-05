<!-- Active Recurrences Section Component -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import {
    getCategoryName,
    getAccountName,
    formatRecurrenceInterval,
  } from '$lib/helpers/financeHelpers';

  export let recurrentTransactions: any[] = [];
  export let categories: any[] = [];
  export let accounts: any[] = [];

  // Helper functions bound with data
  function getCategoryNameBound(categoryId: string) {
    return getCategoryName(categoryId, categories);
  }

  function getAccountNameBound(accountId: string) {
    return getAccountName(accountId, accounts);
  }
</script>

<!-- Active Recurrences Section -->
{#if recurrentTransactions.length > 0}
  <div
    class="bg-purple-50 p-6 rounded-lg shadow-md mb-8 border-l-4 border-purple-500"
  >
    <h2 class="text-2xl font-semibold mb-4 text-purple-800">
      🔄 Active Recurrences
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each recurrentTransactions as recurrence}
        <div class="bg-white p-4 rounded-lg shadow-sm border border-purple-200">
          <div class="flex items-center gap-2 mb-2">
            {#if recurrence.type === 'income'}
              <span class="text-green-600 font-bold">↗️</span>
              <span class="font-medium text-green-700"
                >{recurrence.description}</span
              >
            {:else}
              <span class="text-red-600 font-bold">↘️</span>
              <span class="font-medium text-red-700"
                >{recurrence.description}</span
              >
            {/if}
          </div>

          <div class="text-sm text-gray-600 mb-2">
            {getCategoryNameBound(recurrence.category_id)} • {getAccountNameBound(
              recurrence.account_id
            )}
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
              >
                🔄 {formatRecurrenceInterval(recurrence.recurrence_interval)}
              </span>
              {#if recurrence.type === 'income'}
                <span
                  class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                  >INCOME</span
                >
              {:else}
                <span
                  class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                  >EXPENSE</span
                >
              {/if}
            </div>

            <div class="flex items-center gap-2">
              <span class="font-semibold">
                R$ {parseFloat(recurrence.amount).toFixed(2)}
              </span>
              <form method="POST" action="?/deleteTransaction" use:enhance>
                <input type="hidden" name="id" value={recurrence.id} />
                <button
                  type="submit"
                  class="text-red-600 hover:text-red-800 text-sm"
                  title="Delete recurrence"
                >
                  🗑️
                </button>
              </form>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
