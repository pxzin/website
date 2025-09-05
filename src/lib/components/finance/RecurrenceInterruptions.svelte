<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { showSuccess, showError } from '$lib/stores/toast';
  import { slide } from 'svelte/transition';

  export let recurrentTransactions: any[] = [];
  export let recurrenceAdjustments: any[] = [];

  let showInterruptions = false;
  let selectedTransaction: any = null;
  let interruptionMonth: string = '';
  let currentInterruptionMonth: string = '';

  // Get current month in YYYY-MM format for minimum date
  function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Check if transaction is already interrupted from a certain month
  function getInterruptionMonth(transactionId: string): string | null {
    const interruption = recurrenceAdjustments.find(
      (adj: any) =>
        adj.transaction_id === transactionId &&
        adj.adjusted_amount === 0 &&
        adj.reason === 'RECURRENCE_INTERRUPTION'
    );
    return interruption?.year_month || null;
  }

  // Check if transaction has future interruptions
  function hasInterruption(transactionId: string): boolean {
    return getInterruptionMonth(transactionId) !== null;
  }

  function startInterruption(transaction: any) {
    selectedTransaction = transaction;
    const currentMonth = getCurrentYearMonth();
    currentInterruptionMonth = currentMonth;
  }

  function cancelInterruption() {
    selectedTransaction = null;
    currentInterruptionMonth = '';
  }

  function formatMonthYear(yearMonth: string): string {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6 mt-6">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-semibold flex items-center gap-2">
      <span>⏹️</span>
      Recurrence Interruptions
    </h3>
    <button
      type="button"
      on:click={() => (showInterruptions = !showInterruptions)}
      class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      {showInterruptions ? 'Hide' : 'Manage'} Interruptions
    </button>
  </div>

  {#if showInterruptions}
    <div transition:slide={{ duration: 300 }}>
      {#if recurrentTransactions.length === 0}
        <div class="text-center py-8 text-gray-500">
          <span class="text-2xl">🔄</span>
          <p class="mt-2">No recurrent transactions found</p>
          <p class="text-sm">
            Add some recurrent transactions to manage interruptions
          </p>
        </div>
      {:else}
        <div class="space-y-4">
          <div class="text-sm text-gray-600 mb-4">
            💡 <strong>Tip:</strong> Interrupt recurrent transactions when you need
            to stop them from a specific month onwards (e.g., subscription cancellation,
            job change, etc.)
          </div>

          {#each recurrentTransactions as transaction}
            {@const interruptionMonth = getInterruptionMonth(transaction.id)}
            {@const isInterrupted = hasInterruption(transaction.id)}

            <div
              class="border border-gray-200 rounded-lg p-4 {isInterrupted
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50'}"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-medium">{transaction.description}</span>
                    {#if isInterrupted}
                      <span
                        class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                      >
                        ⏹️ Interrupted
                      </span>
                    {/if}
                    {#if transaction.type === 'income'}
                      <span
                        class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                      >
                        INCOME
                      </span>
                    {:else}
                      <span
                        class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                      >
                        EXPENSE
                      </span>
                    {/if}
                  </div>

                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span
                      >💰 <strong
                        >R$ {Math.abs(transaction.amount).toFixed(2)}</strong
                      ></span
                    >
                    <span>🔄 {transaction.recurrence_interval}</span>
                    <span>📁 {transaction.category_name || 'No Category'}</span>
                  </div>

                  {#if isInterrupted && interruptionMonth}
                    <div class="mt-2 text-sm text-red-600">
                      <span
                        >⏹️ Interrupted from: <strong
                          >{formatMonthYear(interruptionMonth)}</strong
                        ></span
                      >
                    </div>
                  {/if}
                </div>

                <div class="flex gap-2">
                  {#if selectedTransaction?.id === transaction.id}
                    <!-- Interruption Form -->
                    <div class="space-y-3 min-w-64">
                      <form
                        method="POST"
                        action="?/interruptRecurrence"
                        use:enhance={({ formData }) => {
                          return async ({ result }) => {
                            if (result.type === 'success') {
                              showSuccess(
                                'Recurrence interrupted successfully'
                              );
                              cancelInterruption();
                              await invalidateAll();
                            } else {
                              showError('Failed to interrupt recurrence');
                            }
                          };
                        }}
                      >
                        <input
                          type="hidden"
                          name="transactionId"
                          value={transaction.id}
                        />
                        <input
                          type="hidden"
                          name="originalAmount"
                          value={transaction.amount}
                        />

                        <div class="space-y-2">
                          <label
                            for="interruption-month-{transaction.id}"
                            class="block text-sm font-medium text-gray-700"
                          >
                            Stop recurrence from month:
                          </label>
                          <input
                            id="interruption-month-{transaction.id}"
                            type="month"
                            name="interruptionMonth"
                            bind:value={currentInterruptionMonth}
                            min={getCurrentYearMonth()}
                            class="w-full p-2 border rounded text-sm"
                            required
                          />

                          <div class="flex gap-2">
                            <button
                              type="submit"
                              class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              ⏹️ Stop Recurrence
                            </button>
                            <button
                              type="button"
                              on:click={cancelInterruption}
                              class="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  {:else}
                    <!-- Action Buttons -->
                    {#if !isInterrupted}
                      <button
                        type="button"
                        on:click={() => startInterruption(transaction)}
                        class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        ⏹️ Interrupt
                      </button>
                    {:else}
                      <!-- Resume Recurrence -->
                      <form
                        method="POST"
                        action="?/resumeRecurrence"
                        use:enhance={({ formData }) => {
                          return async ({ result }) => {
                            if (result.type === 'success') {
                              showSuccess('Recurrence resumed');
                              await invalidateAll();
                            } else {
                              showError('Failed to resume recurrence');
                            }
                          };
                        }}
                      >
                        <input
                          type="hidden"
                          name="transactionId"
                          value={transaction.id}
                        />
                        <button
                          type="submit"
                          class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          title="Resume recurrence"
                        >
                          ▶️ Resume
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
