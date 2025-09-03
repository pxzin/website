<script lang="ts">
  import { scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let projection: any;
  export let getCategoryType: (categoryId: string) => string;
  export let formatRecurrenceInterval: (interval: string) => string;
</script>

<div
  class="border p-4 rounded-lg h-full bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
  in:scale={{ duration: 300, easing: quintOut, start: 0.9 }}
>
  <h3 class="text-xl font-semibold mb-2">
    {projection.month}
    {projection.year}
  </h3>
  <p class="mb-2">
    Projected Balance: <span
      class="font-bold"
      class:text-red-500={projection.projected_balance < 0}
      class:text-green-500={projection.projected_balance >= 0}
      >${projection.projected_balance.toFixed(2)}</span
    >
  </p>
  <h4 class="text-lg font-medium mb-2">Transactions for this month:</h4>
  <ul class="space-y-2 max-h-64 overflow-y-auto">
    {#each projection.transactions as tx}
      <li
        class="flex items-center justify-between p-3 bg-gray-50 rounded border shadow-sm"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            {#if getCategoryType(tx.category_id) === 'INCOME'}
              <span class="text-green-600 font-bold">↗️</span>
              <span class="text-green-700 font-medium">{tx.description}</span>
              <span
                class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                >INCOME</span
              >
            {:else}
              <span class="text-red-600 font-bold">↘️</span>
              <span class="text-red-700 font-medium">{tx.description}</span>
              <span
                class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                >EXPENSE</span
              >
            {/if}
          </div>

          <!-- Transaction Details -->
          <div class="flex flex-wrap gap-1 mt-1">
            {#if tx.installment_number}
              <span
                class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1"
              >
                📊 Installment {tx.installment_number}
              </span>
              {#if tx.installments_total}
                <span
                  class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                >
                  of {tx.installments_total}
                </span>
                <span
                  class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                >
                  ({Math.round(
                    (tx.installment_number / tx.installments_total) * 100
                  )}% of total)
                </span>
              {/if}
            {/if}

            {#if tx.is_recurrent}
              <span
                class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1"
              >
                🔄 {formatRecurrenceInterval(tx.recurrence_interval)}
              </span>
            {/if}
          </div>
        </div>

        <div class="text-right ml-4">
          <div
            class="font-semibold text-lg"
            class:text-green-600={getCategoryType(tx.category_id) === 'INCOME'}
            class:text-red-600={getCategoryType(tx.category_id) === 'EXPENSE'}
          >
            {#if getCategoryType(tx.category_id) === 'EXPENSE'}
              -${Math.abs(tx.amount).toFixed(2)}
            {:else}
              +${tx.amount.toFixed(2)}
            {/if}
          </div>
          {#if tx.installment_number && tx.installments_total}
            <div class="text-xs text-gray-500">
              {#if getCategoryType(tx.category_id) === 'EXPENSE'}
                Total: -${Math.abs(tx.amount * tx.installments_total).toFixed(
                  2
                )}
              {:else}
                Total: +${(tx.amount * tx.installments_total).toFixed(2)}
              {/if}
            </div>
          {/if}
        </div>
      </li>
    {/each}
    {#if projection.transactions.length === 0}
      <li class="text-center text-gray-500 italic p-4">
        No transactions projected for this month
      </li>
    {/if}
  </ul>
</div>
