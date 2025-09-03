<script lang="ts">
  import { scale, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let projection: any;
  export let getCategoryType: (categoryId: string) => string;
  export let formatRecurrenceInterval: (interval: string) => string;

  // Calculate percentage change from previous month
  $: balanceChangePercent =
    projection.previous_balance !== 0
      ? (projection.balance_change / Math.abs(projection.previous_balance)) *
        100
      : 0;

  // Get account entries sorted by balance
  $: accountEntries = Object.entries(projection.account_balances || {})
    .map(([id, data]: [string, any]) => ({ id, ...data }))
    .sort((a, b) => b.balance - a.balance);
</script>

<div
  class="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl h-full shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group"
  in:scale={{ duration: 400, easing: quintOut, start: 0.95 }}
>
  <!-- Header -->
  <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-bold">
          {projection.month}
          {projection.year}
        </h3>
        <p class="text-blue-100 text-sm">Financial Projection</p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold">
          ${Math.abs(projection.projected_balance).toFixed(0)}
        </div>
        <div class="text-xs text-blue-100">
          {projection.projected_balance >= 0 ? 'Positive' : 'Negative'} Balance
        </div>
      </div>
    </div>
  </div>

  <!-- Balance Summary -->
  <div class="p-4 bg-white border-b border-gray-100">
    <div class="grid grid-cols-2 gap-4">
      <!-- Previous vs Current -->
      <div class="text-center">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Previous</p>
        <p class="text-lg font-semibold text-gray-700">
          ${projection.previous_balance.toFixed(2)}
        </p>
      </div>
      <div class="text-center">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Projected</p>
        <p
          class="text-lg font-semibold"
          class:text-green-600={projection.projected_balance >= 0}
          class:text-red-600={projection.projected_balance < 0}
        >
          ${projection.projected_balance.toFixed(2)}
        </p>
      </div>
    </div>

    <!-- Change Indicator -->
    <div class="mt-3 text-center">
      <div
        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
        class:bg-green-100={projection.balance_change >= 0}
        class:text-green-800={projection.balance_change >= 0}
        class:bg-red-100={projection.balance_change < 0}
        class:text-red-800={projection.balance_change < 0}
      >
        {#if projection.balance_change >= 0}
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
          +${projection.balance_change.toFixed(2)}
        {:else}
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
          ${projection.balance_change.toFixed(2)}
        {/if}
        {#if Math.abs(balanceChangePercent) > 0.1}
          <span class="ml-1 text-xs"
            >({balanceChangePercent > 0
              ? '+'
              : ''}{balanceChangePercent.toFixed(1)}%)</span
          >
        {/if}
      </div>
    </div>
  </div>

  <!-- Income vs Expenses -->
  <div class="p-4 bg-gray-50 border-b border-gray-100">
    <h4 class="text-sm font-semibold text-gray-700 mb-3">Monthly Flow</h4>
    <div class="grid grid-cols-3 gap-4 text-center">
      <div>
        <p class="text-xs text-green-600 uppercase tracking-wide">Income</p>
        <p class="text-sm font-bold text-green-700">
          +${projection.total_income.toFixed(2)}
        </p>
      </div>
      <div>
        <p class="text-xs text-red-600 uppercase tracking-wide">Expenses</p>
        <p class="text-sm font-bold text-red-700">
          -${projection.total_expenses.toFixed(2)}
        </p>
      </div>
      <div>
        <p class="text-xs text-blue-600 uppercase tracking-wide">Net</p>
        <p
          class="text-sm font-bold"
          class:text-green-700={projection.net_change >= 0}
          class:text-red-700={projection.net_change < 0}
        >
          {projection.net_change >= 0
            ? '+'
            : ''}${projection.net_change.toFixed(2)}
        </p>
      </div>
    </div>
  </div>

  <!-- Account Balances -->
  {#if accountEntries.length > 0}
    <div class="p-4 border-b border-gray-100">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">
        Account Projections
      </h4>
      <div class="space-y-2 max-h-32 overflow-y-auto">
        {#each accountEntries as account}
          <div
            class="flex items-center justify-between py-2 px-3 bg-white rounded-lg border"
          >
            <div class="flex items-center">
              <div
                class="w-2 h-2 rounded-full mr-2"
                class:bg-green-400={account.balance >= 0}
                class:bg-red-400={account.balance < 0}
              ></div>
              <span class="text-xs font-medium text-gray-700 truncate"
                >{account.name}</span
              >
            </div>
            <div class="text-right">
              <p
                class="text-xs font-semibold"
                class:text-green-600={account.balance >= 0}
                class:text-red-600={account.balance < 0}
              >
                ${account.balance.toFixed(2)}
              </p>
              {#if Math.abs(account.change) > 0.01}
                <p class="text-xs text-gray-500">
                  {account.change >= 0 ? '+' : ''}${account.change.toFixed(2)}
                </p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Transactions Preview -->
  <div class="p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-gray-700">Transactions</h4>
      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
        {projection.transactions.length} total
      </span>
    </div>

    {#if projection.transactions.length > 0}
      <div class="space-y-2 max-h-48 overflow-y-auto">
        {#each projection.transactions.slice(0, 6) as tx, i}
          <div
            class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border"
            in:fly={{ y: 20, duration: 300, delay: i * 50 }}
          >
            <div class="flex items-center flex-1 min-w-0">
              {#if getCategoryType(tx.category_id) === 'INCOME'}
                <div
                  class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
                >
                  <svg
                    class="w-3 h-3 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              {:else}
                <div
                  class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
                >
                  <svg
                    class="w-3 h-3 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              {/if}

              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-700 truncate">
                  {tx.description}
                </p>
                <div class="flex items-center gap-1 mt-1">
                  {#if tx.installment_number}
                    <span
                      class="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded"
                    >
                      {tx.installment_number}/{tx.installments_total}
                    </span>
                  {/if}
                  {#if tx.is_recurrent}
                    <span
                      class="text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded"
                    >
                      🔄
                    </span>
                  {/if}
                </div>
              </div>
            </div>

            <div class="text-right ml-2">
              <p
                class="text-xs font-bold"
                class:text-green-600={getCategoryType(tx.category_id) ===
                  'INCOME'}
                class:text-red-600={getCategoryType(tx.category_id) ===
                  'EXPENSE'}
              >
                {#if getCategoryType(tx.category_id) === 'EXPENSE'}
                  -${Math.abs(tx.amount).toFixed(2)}
                {:else}
                  +${tx.amount.toFixed(2)}
                {/if}
              </p>
            </div>
          </div>
        {/each}

        {#if projection.transactions.length > 6}
          <div class="text-center py-2">
            <span class="text-xs text-gray-500">
              +{projection.transactions.length - 6} more transactions
            </span>
          </div>
        {/if}
      </div>
    {:else}
      <div class="text-center py-8 text-gray-500">
        <svg
          class="w-8 h-8 mx-auto mb-2 opacity-50"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
          <path
            fill-rule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <p class="text-xs">No transactions projected</p>
      </div>
    {/if}
  </div>

  <!-- Hover Effect Gradient -->
  <div
    class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
  ></div>
</div>
