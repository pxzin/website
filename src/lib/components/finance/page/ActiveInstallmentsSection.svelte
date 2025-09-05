<!-- Active Installments Section Component -->
<script lang="ts">
  import {
    getCategoryName,
    getAccountName,
    getInstallmentStatus,
  } from '$lib/helpers/financeHelpers';
  import { InstallmentDetails } from '$lib/components';

  export let installmentTransactions: any[] = [];
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

<!-- Active Installments Section -->
{#if installmentTransactions.length > 0}
  <div
    class="bg-blue-50 p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-500"
  >
    <h2 class="text-2xl font-semibold mb-4 text-blue-800">
      📊 Active Installments
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each installmentTransactions as installment}
        {@const status = getInstallmentStatus(installment)}
        {#if status && !status.isComplete}
          <div class="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <div class="flex items-center gap-2 mb-2">
              {#if installment.type === 'income'}
                <span class="text-green-600 font-bold">↗️</span>
                <span class="font-medium text-green-700"
                  >{installment.description}</span
                >
              {:else}
                <span class="text-red-600 font-bold">↘️</span>
                <span class="font-medium text-red-700"
                  >{installment.description}</span
                >
              {/if}
            </div>

            <div class="text-sm text-gray-600 mb-2">
              {getCategoryNameBound(installment.category_id)} • {getAccountNameBound(
                installment.account_id
              )}
            </div>

            <!-- Progress Bar -->
            <div class="mb-2">
              <div class="flex justify-between text-xs text-gray-600 mb-1">
                <span>{status.paid}/{status.total} installments</span>
                <span>{status.percentage}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style="width: {status.percentage}%"
                ></div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                >
                  📊 {status.remaining} remaining
                </span>
                {#if installment.type === 'income'}
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
              <div class="text-right">
                <div
                  class="font-semibold"
                  class:text-green-600={installment.type === 'income'}
                  class:text-red-600={installment.type === 'expense'}
                >
                  {#if installment.type === 'expense'}
                    -${Math.abs(installment.amount).toFixed(2)} total
                  {:else}
                    +${installment.amount.toFixed(2)} total
                  {/if}
                </div>
                <div class="text-xs text-gray-500">
                  {#if installment.type === 'expense'}
                    -${Math.abs(
                      installment.amount / installment.installments_total
                    ).toFixed(2)}/installment
                  {:else}
                    +${(
                      installment.amount / installment.installments_total
                    ).toFixed(2)}/installment
                  {/if}
                </div>
              </div>
            </div>

            <!-- Installment Details -->
            <InstallmentDetails transaction={installment} />

            <div class="mt-2 text-xs text-gray-500">
              Start: {installment.installment_start_date || installment.date}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </div>
{/if}
