<!-- Recent Transactions Component -->
<script lang="ts">
  import { fly } from 'svelte/transition';

  export let recentTransactions: any[] = [];
</script>

{#if recentTransactions.length > 0}
  <div
    class="bg-gray-50 border border-gray-200 rounded-lg p-6"
    in:fly={{ y: 20, duration: 400, delay: 600 }}
  >
    <h3 class="text-lg font-semibold text-gray-800 mb-4">
      🕒 Recent Transactions
    </h3>
    <div class="space-y-2 max-h-64 overflow-y-auto">
      {#each recentTransactions as transaction}
        <div
          class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
        >
          <div class="flex-1">
            <p class="font-medium text-gray-800 text-sm">
              {transaction.description || 'No description'}
            </p>
            <p class="text-xs text-gray-500">
              {transaction.category} • {new Date(
                transaction.date
              ).toLocaleDateString()}
            </p>
          </div>
          <div class="text-right">
            <p
              class="font-semibold text-sm"
              class:text-green-600={transaction.amount > 0}
              class:text-red-600={transaction.amount < 0}
            >
              {#if transaction.amount > 0}
                +${transaction.amount.toFixed(2)}
              {:else}
                -${Math.abs(transaction.amount).toFixed(2)}
              {/if}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
