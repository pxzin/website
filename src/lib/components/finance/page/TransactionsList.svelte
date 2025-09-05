<!-- Transactions List Component -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import {
    getCategoryName,
    getAccountName,
    getInstallmentStatus,
    getBalanceImpact,
    formatRecurrenceInterval,
    getCurrentMonthTransactions,
  } from '$lib/helpers/financeHelpers';
  import { createDeleteTransactionEnhance } from '$lib/helpers/financeActions';

  export let transactions: any[] = [];
  export let categories: any[] = [];
  export let accounts: any[] = [];

  // Local state
  let activeTransactionsTab: 'current' | 'all' = 'current';

  // Computed values
  $: currentMonthTransactions = getCurrentMonthTransactions(transactions);

  // Helper functions bound with data
  function getCategoryNameBound(categoryId: string) {
    return getCategoryName(categoryId, categories);
  }

  function getAccountNameBound(accountId: string) {
    return getAccountName(accountId, accounts);
  }

  // Delete transaction enhance
  function deleteTransactionEnhance() {
    return createDeleteTransactionEnhance();
  }
</script>

<!-- Transactions List -->
<div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md mb-8">
  <h2 class="text-2xl font-semibold mb-4">Transactions</h2>

  <!-- Tabs -->
  <div class="flex border-b border-gray-200 mb-4">
    <button
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200"
      class:border-blue-500={activeTransactionsTab === 'current'}
      class:text-blue-600={activeTransactionsTab === 'current'}
      class:border-transparent={activeTransactionsTab !== 'current'}
      class:text-gray-500={activeTransactionsTab !== 'current'}
      on:click={() => (activeTransactionsTab = 'current')}
    >
      Current Month ({currentMonthTransactions.length})
    </button>
    <button
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ml-4"
      class:border-blue-500={activeTransactionsTab === 'all'}
      class:text-blue-600={activeTransactionsTab === 'all'}
      class:border-transparent={activeTransactionsTab !== 'all'}
      class:text-gray-500={activeTransactionsTab !== 'all'}
      on:click={() => (activeTransactionsTab = 'all')}
    >
      All Transactions ({transactions.length})
    </button>
  </div>

  <!-- Tab Content -->
  {#if activeTransactionsTab === 'current'}
    <div class="space-y-2">
      {#if currentMonthTransactions.length === 0}
        <div class="text-center text-gray-500 py-8">
          <p class="text-lg">No transactions found for this month</p>
          <p class="text-sm">Add transactions using the form above</p>
        </div>
      {:else}
        {#each currentMonthTransactions as transaction}
          <div
            class="flex justify-between items-center p-3 border-b border-gray-200 last:border-b-0 bg-white rounded mb-2 shadow-sm"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                {#if transaction.type === 'income'}
                  <span class="text-green-600 font-bold">↗️</span>
                  <span class="font-medium">{transaction.description}</span>
                  <span
                    class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                    >INCOME</span
                  >
                {:else}
                  <span class="text-red-600 font-bold">↘️</span>
                  <span class="font-medium">{transaction.description}</span>
                  <span
                    class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                    >EXPENSE</span
                  >
                {/if}
              </div>

              <!-- Transaction Info -->
              <div class="text-sm text-gray-600 mb-1">
                {getCategoryNameBound(transaction.category_id)} - {getAccountNameBound(
                  transaction.account_id
                )} ({transaction.date})
              </div>

              <!-- Installment and Recurrence Info -->
              <div class="flex flex-wrap gap-1">
                {#if transaction.is_recurrent}
                  <span
                    class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    🔄 {formatRecurrenceInterval(
                      transaction.recurrence_interval
                    )}
                  </span>
                {/if}

                {#if transaction.installments_total}
                  {@const installmentStatus = getInstallmentStatus(transaction)}
                  {#if installmentStatus}
                    <span
                      class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      📊 {installmentStatus.paid}/{installmentStatus.total} installments
                    </span>
                    <span
                      class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {installmentStatus.percentage}% paid
                    </span>
                    {#if installmentStatus.isComplete}
                      <span
                        class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                      >
                        ✅ Completed
                      </span>
                    {:else}
                      <span
                        class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full"
                      >
                        ⏳ {installmentStatus.remaining} remaining
                      </span>
                    {/if}
                  {/if}
                {/if}
              </div>
            </div>

            <div class="flex items-center gap-2 ml-4">
              <div class="text-right">
                <div
                  class="font-semibold text-lg"
                  class:text-green-500={transaction.type === 'income'}
                  class:text-red-500={transaction.type === 'expense'}
                >
                  {#if transaction.type === 'expense'}
                    -${Math.abs(getBalanceImpact(transaction)).toFixed(2)}
                  {:else}
                    +${getBalanceImpact(transaction).toFixed(2)}
                  {/if}
                </div>
                {#if transaction.installments_total && transaction.installments_total > 1}
                  <div class="text-xs text-gray-500">
                    Total: {#if transaction.type === 'expense'}-{/if}${Math.abs(
                      transaction.amount
                    ).toFixed(2)}
                  </div>
                {/if}
              </div>
              <form
                method="POST"
                action="?/deleteTransaction"
                use:enhance={deleteTransactionEnhance()}
                class="inline"
              >
                <input
                  type="hidden"
                  name="transactionId"
                  value={transaction.id}
                />
                <button
                  type="submit"
                  class="text-red-500 text-sm hover:underline">Delete</button
                >
              </form>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {:else}
    <!-- All Transactions Tab -->
    <div class="space-y-2">
      {#if transactions.length === 0}
        <div class="text-center text-gray-500 py-8">
          <p class="text-lg">No transactions found</p>
          <p class="text-sm">Add transactions using the form above</p>
        </div>
      {:else}
        {#each transactions as transaction}
          <div
            class="flex justify-between items-center p-3 border-b border-gray-200 last:border-b-0 bg-white rounded mb-2 shadow-sm"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                {#if transaction.type === 'income'}
                  <span class="text-green-600 font-bold">↗️</span>
                  <span class="font-medium">{transaction.description}</span>
                  <span
                    class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                    >INCOME</span
                  >
                {:else}
                  <span class="text-red-600 font-bold">↘️</span>
                  <span class="font-medium">{transaction.description}</span>
                  <span
                    class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                    >EXPENSE</span
                  >
                {/if}
              </div>

              <!-- Transaction Info -->
              <div class="text-sm text-gray-600 mb-1">
                {getCategoryNameBound(transaction.category_id)} - {getAccountNameBound(
                  transaction.account_id
                )} ({transaction.date})
              </div>

              <!-- Installment and Recurrence Info -->
              <div class="flex flex-wrap gap-1">
                {#if transaction.is_recurrent}
                  <span
                    class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    🔄 {formatRecurrenceInterval(
                      transaction.recurrence_interval
                    )}
                  </span>
                {/if}

                {#if transaction.installments_total}
                  {@const installmentStatus = getInstallmentStatus(transaction)}
                  {#if installmentStatus}
                    <span
                      class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      📊 {installmentStatus.paid}/{installmentStatus.total} installments
                    </span>
                    <span
                      class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {installmentStatus.percentage}% paid
                    </span>
                    {#if installmentStatus.isComplete}
                      <span
                        class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                      >
                        ✅ Completed
                      </span>
                    {:else}
                      <span
                        class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full"
                      >
                        ⏳ {installmentStatus.remaining} remaining
                      </span>
                    {/if}
                  {/if}
                {/if}
              </div>
            </div>

            <div class="flex items-center gap-2 ml-4">
              <div class="text-right">
                <div
                  class="font-semibold text-lg"
                  class:text-green-500={transaction.type === 'income'}
                  class:text-red-500={transaction.type === 'expense'}
                >
                  {#if transaction.type === 'expense'}
                    -${Math.abs(getBalanceImpact(transaction)).toFixed(2)}
                  {:else}
                    +${getBalanceImpact(transaction).toFixed(2)}
                  {/if}
                </div>
                {#if transaction.installments_total && transaction.installments_total > 1}
                  <div class="text-xs text-gray-500">
                    Total: {#if transaction.type === 'expense'}-{/if}${Math.abs(
                      transaction.amount
                    ).toFixed(2)}
                  </div>
                {/if}
              </div>
              <form
                method="POST"
                action="?/deleteTransaction"
                use:enhance={deleteTransactionEnhance()}
                class="inline"
              >
                <input
                  type="hidden"
                  name="transactionId"
                  value={transaction.id}
                />
                <button
                  type="submit"
                  class="text-red-500 text-sm hover:underline">Delete</button
                >
              </form>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
