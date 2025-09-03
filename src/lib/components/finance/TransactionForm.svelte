<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { showError, showSuccess } from '$lib/stores/toast';

  export let accounts: any[] = [];
  export let categories: any[] = [];
  export let showForm = false;

  let newTransactionDescription = '';
  let newTransactionAmount = 0;
  let newTransactionDate = new Date().toISOString().split('T')[0];
  let newTransactionAccountId = '';
  let newTransactionCategoryId = '';
  let newTransactionIsRecurrent = false;
  let newTransactionRecurrenceInterval = 'MONTHLY';
  let newTransactionInstallmentsTotal: number | null = null;
  let newTransactionInstallmentsPaid: number | null = null;
  let newTransactionInstallmentStartDate: string | null = null;

  function resetForm() {
    newTransactionDescription = '';
    newTransactionAmount = 0;
    newTransactionDate = new Date().toISOString().split('T')[0];
    newTransactionAccountId = '';
    newTransactionCategoryId = '';
    newTransactionIsRecurrent = false;
    newTransactionRecurrenceInterval = 'MONTHLY';
    newTransactionInstallmentsTotal = null;
    newTransactionInstallmentsPaid = null;
    newTransactionInstallmentStartDate = null;
    showForm = false;
  }

  function toggleForm() {
    showForm = !showForm;
  }
</script>

<div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-semibold flex items-center gap-2">
      <span>💸</span>
      Add Transaction
    </h2>
    <button
      type="button"
      on:click={toggleForm}
      title={showForm ? 'Close form' : 'Add new transaction'}
      class="px-3 py-2 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
    >
      <span class="text-xl">{showForm ? '−' : '+'}</span>
    </button>
  </div>

  {#if showForm}
    <div transition:slide={{ duration: 300 }} class="border-t pt-4">
      <form
        method="POST"
        action="?/addTransaction"
        use:enhance={({ formData }) => {
          return async ({ result }) => {
            if (result.type === 'failure') {
              showError(result.data?.error || 'Failed to add transaction');
            } else if (result.type === 'success') {
              showSuccess('Transaction added successfully');
              resetForm();
              await invalidateAll();
            }
          };
        }}
        class="space-y-4"
      >
        <h3 class="text-lg font-semibold mb-3">Add New Transaction</h3>
        <div>
          <label
            for="transaction-description"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Description</label
          >
          <input
            id="transaction-description"
            type="text"
            name="description"
            placeholder="e.g., Grocery shopping, Salary payment"
            bind:value={newTransactionDescription}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label
            for="transaction-amount"
            class="block text-sm font-medium text-gray-700 mb-1">Amount</label
          >
          <input
            id="transaction-amount"
            type="number"
            name="amount"
            placeholder="0.00"
            bind:value={newTransactionAmount}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            step="0.01"
            required
          />
        </div>
        <div>
          <label
            for="transaction-date"
            class="block text-sm font-medium text-gray-700 mb-1">Date</label
          >
          <input
            id="transaction-date"
            type="date"
            name="date"
            bind:value={newTransactionDate}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label
            for="transaction-account"
            class="block text-sm font-medium text-gray-700 mb-1">Account</label
          >
          <select
            id="transaction-account"
            name="accountId"
            bind:value={newTransactionAccountId}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            required
          >
            <option value="">Select Account</option>
            {#each accounts as account}
              <option value={account.id}>{account.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label
            for="transaction-category"
            class="block text-sm font-medium text-gray-700 mb-1">Category</label
          >
          <select
            id="transaction-category"
            name="categoryId"
            bind:value={newTransactionCategoryId}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            required
          >
            <option value="">Select Category</option>
            {#each categories as category}
              <option value={category.id}
                >{category.name} ({category.type})</option
              >
            {/each}
          </select>
        </div>

        <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <input
            id="recurrent-checkbox"
            type="checkbox"
            name="isRecurrent"
            bind:checked={newTransactionIsRecurrent}
            class="w-4 h-4 text-[var(--color-primary-accent)] rounded focus:ring-2 focus:ring-[var(--color-primary-accent)]"
          />
          <label for="recurrent-checkbox" class="text-sm font-medium"
            >Recurrent Transaction</label
          >
        </div>
        {#if newTransactionIsRecurrent}
          <div>
            <label
              for="recurrence-interval"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Recurrence Interval</label
            >
            <select
              id="recurrence-interval"
              name="recurrenceInterval"
              bind:value={newTransactionRecurrenceInterval}
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            >
              <option value="MONTHLY">📅 Monthly</option>
              <option value="YEARLY">🗓️ Yearly</option>
            </select>
          </div>
        {/if}

        <div class="p-3 bg-gray-50 rounded-lg">
          <label for="installments-total" class="text-sm font-medium mb-2 block"
            >Installment Transaction</label
          >
          <input
            id="installments-total"
            type="number"
            name="installmentsTotal"
            placeholder="Total Installments"
            bind:value={newTransactionInstallmentsTotal}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            min="1"
          />
        </div>
        {#if newTransactionInstallmentsTotal}
          <div>
            <label
              for="installments-paid"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Installments Already Paid</label
            >
            <input
              id="installments-paid"
              type="number"
              name="installmentsPaid"
              placeholder="0"
              bind:value={newTransactionInstallmentsPaid}
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
              min="0"
            />
          </div>
          <div>
            <label
              for="installment-start-date"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Installment Start Date</label
            >
            <input
              id="installment-start-date"
              type="date"
              name="installmentStartDate"
              bind:value={newTransactionInstallmentStartDate}
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            />
          </div>
        {/if}

        <div class="flex gap-2">
          <button
            type="button"
            on:click={() => (showForm = false)}
            class="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >Cancel</button
          >
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >Add Transaction</button
          >
        </div>
      </form>
    </div>
  {/if}
</div>
