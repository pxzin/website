<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { showSuccess, showError } from '$lib/stores/toast';
  import { slide } from 'svelte/transition';

  export let projections: any[] = [];
  export let recurrenceAdjustments: any[] = [];

  let showAdjustments = false;
  let editingMonth: string | null = null;
  let adjustmentValues: Record<string, { amount: number; reason: string }> = {};

  // Get current month in YYYY-MM format
  function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Get recurrent transactions that need attention
  $: recurrentTransactionsToAdjust = projections.flatMap(
    (projection, index) => {
      if (!projection.transactions) return [];

      const projectionDate = new Date();
      projectionDate.setMonth(projectionDate.getMonth() + index + 1); // Start from next month
      const yearMonth = `${projectionDate.getFullYear()}-${String(projectionDate.getMonth() + 1).padStart(2, '0')}`;

      return projection.transactions
        .filter((tx: any) => tx.is_recurrent)
        .map((tx: any) => {
          // Use original transaction ID for adjustments
          const transactionId = tx.originalTransactionId || tx.id;

          // Check if this transaction has an adjustment
          const adjustment = recurrenceAdjustments.find(
            (adj: any) =>
              adj.transaction_id === transactionId &&
              adj.year_month === yearMonth
          );

          return {
            ...tx,
            originalTransactionId: transactionId, // Ensure we have the correct ID
            yearMonth,
            projectionIndex: index,
            monthName: projectionDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            }),
            hasAdjustment: !!adjustment,
            adjustedAmount: adjustment?.adjusted_amount || tx.amount,
            originalAmount: tx.originalAmount || tx.amount,
            adjustmentReason: adjustment?.reason || null,
            // Ensure category and account names are preserved
            category_name: tx.category_name,
            account_name: tx.account_name,
          };
        });
    }
  );

  function startEditing(transaction: any) {
    editingMonth = `${transaction.originalTransactionId}-${transaction.yearMonth}`;
    adjustmentValues[editingMonth] = {
      amount: transaction.hasAdjustment
        ? transaction.adjustedAmount
        : transaction.originalAmount,
      reason: transaction.adjustmentReason || '',
    };
  }

  function cancelEditing() {
    editingMonth = null;
    adjustmentValues = {};
  }

  // Auto-suggestion for common adjustment reasons
  const commonReasons = [
    '5 weeks this month',
    '4 weeks this month',
    'Holiday skip',
    'Vacation adjustment',
    'Extra session',
    'Price change',
    'One-time variation',
  ];
</script>

<div class="bg-white rounded-lg shadow-md p-6 mt-6">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-semibold flex items-center gap-2">
      <span>🔧</span>
      Recurrence Adjustments
    </h3>
    <button
      type="button"
      on:click={() => (showAdjustments = !showAdjustments)}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      {showAdjustments ? 'Hide' : 'Manage'} Adjustments
    </button>
  </div>

  {#if showAdjustments}
    <div transition:slide={{ duration: 300 }}>
      {#if recurrentTransactionsToAdjust.length === 0}
        <div class="text-center py-8 text-gray-500">
          <span class="text-2xl">📅</span>
          <p class="mt-2">No recurrent transactions found in projections</p>
          <p class="text-sm">
            Add some recurrent transactions to manage adjustments
          </p>
        </div>
      {:else}
        <div class="space-y-4">
          <div class="text-sm text-gray-600 mb-4">
            💡 <strong>Tip:</strong> Adjust recurrent transactions for months with
            variations (e.g., 5 Thursdays instead of 4, holidays, price changes)
          </div>

          {#each recurrentTransactionsToAdjust as transaction (transaction.originalTransactionId + transaction.yearMonth)}
            <div
              class="border border-gray-200 rounded-lg p-4 {transaction.hasAdjustment
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50'}"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-medium">{transaction.description}</span>
                    <span class="text-sm text-gray-500"
                      >• {transaction.monthName}</span
                    >
                    {#if transaction.hasAdjustment}
                      <span
                        class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      >
                        Adjusted
                      </span>
                    {/if}
                  </div>

                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span
                      >💰 Original: <strong
                        >${Math.abs(transaction.originalAmount).toFixed(
                          2
                        )}</strong
                      ></span
                    >
                    {#if transaction.hasAdjustment}
                      <span
                        >→ Current: <strong class="text-blue-600"
                          >${Math.abs(transaction.adjustedAmount).toFixed(
                            2
                          )}</strong
                        ></span
                      >
                    {/if}
                    <span>📁 {transaction.category_name || 'No Category'}</span>
                    <span>🏛️ {transaction.account_name || 'No Account'}</span>
                  </div>

                  {#if transaction.hasAdjustment && transaction.adjustmentReason}
                    <div class="mt-2 text-sm text-blue-600">
                      <span>📝 Reason: {transaction.adjustmentReason}</span>
                    </div>
                  {/if}
                </div>

                <div class="flex gap-2">
                  {#if editingMonth === `${transaction.originalTransactionId}-${transaction.yearMonth}`}
                    <!-- Editing Mode -->
                    <div class="space-y-3 min-w-64">
                      <form
                        method="POST"
                        action="?/adjustRecurrence"
                        use:enhance={({ formData }) => {
                          return async ({ result }) => {
                            if (result.type === 'success') {
                              showSuccess('Recurrence adjusted successfully');
                              cancelEditing();
                              await invalidateAll();
                            } else {
                              showError('Failed to adjust recurrence');
                            }
                          };
                        }}
                      >
                        <input
                          type="hidden"
                          name="transactionId"
                          value={transaction.originalTransactionId}
                        />
                        <input
                          type="hidden"
                          name="yearMonth"
                          value={transaction.yearMonth}
                        />
                        <input
                          type="hidden"
                          name="originalAmount"
                          value={transaction.originalAmount}
                        />

                        <div class="space-y-2">
                          <input
                            type="number"
                            name="adjustedAmount"
                            step="0.01"
                            placeholder="Adjusted amount"
                            bind:value={adjustmentValues[editingMonth].amount}
                            class="w-full p-2 border rounded text-sm"
                            required
                          />

                          <input
                            type="text"
                            name="reason"
                            placeholder="Reason for adjustment (optional)"
                            bind:value={adjustmentValues[editingMonth].reason}
                            class="w-full p-2 border rounded text-sm"
                            list="common-reasons"
                          />

                          <datalist id="common-reasons">
                            {#each commonReasons as reason}
                              <option value={reason}></option>
                            {/each}
                          </datalist>

                          <div class="flex gap-2">
                            <button
                              type="submit"
                              class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              ✅ Save
                            </button>
                            <button
                              type="button"
                              on:click={cancelEditing}
                              class="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  {:else}
                    <!-- View Mode -->
                    <button
                      type="button"
                      on:click={() => startEditing(transaction)}
                      class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      ✏️ Adjust
                    </button>

                    {#if transaction.hasAdjustment}
                      <form
                        method="POST"
                        action="?/removeRecurrenceAdjustment"
                        use:enhance={({ formData }) => {
                          return async ({ result }) => {
                            if (result.type === 'success') {
                              showSuccess('Adjustment removed');
                              await invalidateAll();
                            } else {
                              showError('Failed to remove adjustment');
                            }
                          };
                        }}
                      >
                        <input
                          type="hidden"
                          name="transactionId"
                          value={transaction.originalTransactionId}
                        />
                        <input
                          type="hidden"
                          name="yearMonth"
                          value={transaction.yearMonth}
                        />
                        <button
                          type="submit"
                          class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          title="Remove adjustment"
                        >
                          🗑️ Reset
                        </button>
                      </form>
                    {/if}
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
