<script lang="ts">
  import { enhance } from '$app/forms';
  import { slide } from 'svelte/transition';
  import { showError, showSuccess } from '$lib/stores/toast';

  export let accounts: any[] = [];
  export let showForm = false;

  let newAccountName = '';
  let newAccountType = 'CHECKING';
  let newAccountInitialBalance = 0;
  let newAccountCreditLimit: number | null = null;
  let newAccountDueDay: number | null = null;

  function resetForm() {
    newAccountName = '';
    newAccountType = 'CHECKING';
    newAccountInitialBalance = 0;
    newAccountCreditLimit = null;
    newAccountDueDay = null;
    showForm = false;
  }

  function toggleForm() {
    showForm = !showForm;
  }
</script>

<div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-semibold flex items-center gap-2">
      <span>🏦</span>
      Accounts
    </h2>
    <button
      type="button"
      on:click={toggleForm}
      title={showForm ? 'Close form' : 'Add new account'}
      class="px-3 py-2 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
    >
      <span class="text-xl">{showForm ? '−' : '+'}</span>
    </button>
  </div>

  {#if accounts.length === 0}
    <div class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">🏦</div>
      <p>No accounts yet. Add your first account to get started!</p>
    </div>
  {:else}
    <ul class="space-y-2 mb-4">
      {#each accounts as account}
        <li
          class="flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
        >
          <div class="flex items-center gap-3">
            <div class="text-2xl">
              {#if account.type === 'CHECKING'}
                🏦
              {:else if account.type === 'CREDIT_CARD'}
                💳
              {:else}
                💰
              {/if}
            </div>
            <div>
              <span class="font-medium">{account.name}</span>
              <span class="text-sm text-gray-500 block">{account.type}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-lg"
              >${account.current_balance.toFixed(2)}</span
            >
            <form
              method="POST"
              action="?/deleteAccount"
              use:enhance={({ formData }) => {
                return async ({ result }) => {
                  if (result.type === 'failure') {
                    showError(result.data?.error || 'Failed to delete account');
                  } else if (result.type === 'success') {
                    showSuccess('Account deleted successfully');
                  }
                };
              }}
              class="inline"
            >
              <input type="hidden" name="accountId" value={account.id} />
              <button
                type="submit"
                class="text-red-500 text-sm hover:underline p-1">✕</button
              >
            </form>
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  {#if showForm}
    <div transition:slide={{ duration: 300 }} class="border-t pt-4">
      <form
        method="POST"
        action="?/addAccount"
        use:enhance={({ formData }) => {
          return async ({ result }) => {
            if (result.type === 'failure') {
              showError(result.data?.error || 'Failed to add account');
            } else if (result.type === 'success') {
              showSuccess('Account added successfully');
              resetForm();
            }
          };
        }}
        class="space-y-4"
      >
        <h3 class="text-lg font-semibold mb-3">Add New Account</h3>
        <div>
          <label
            for="account-name"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Account Name</label
          >
          <input
            id="account-name"
            type="text"
            name="name"
            placeholder="e.g., My Checking Account"
            bind:value={newAccountName}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label
            for="account-type"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Account Type</label
          >
          <select
            id="account-type"
            name="type"
            bind:value={newAccountType}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
          >
            <option value="CHECKING">🏦 Checking Account</option>
            <option value="CREDIT_CARD">💳 Credit Card</option>
            <option value="CASH">💰 Cash</option>
          </select>
        </div>
        <div>
          <label
            for="initial-balance"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Initial Balance</label
          >
          <input
            id="initial-balance"
            type="number"
            name="initialBalance"
            placeholder="0.00"
            bind:value={newAccountInitialBalance}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            step="0.01"
            required
          />
        </div>
        {#if newAccountType === 'CREDIT_CARD'}
          <div>
            <label
              for="credit-limit"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Credit Limit</label
            >
            <input
              id="credit-limit"
              type="number"
              name="creditLimit"
              placeholder="0.00"
              bind:value={newAccountCreditLimit}
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
              step="0.01"
            />
          </div>
          <div>
            <label
              for="due-day"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Due Day</label
            >
            <input
              id="due-day"
              type="number"
              name="dueDay"
              placeholder="1-31"
              bind:value={newAccountDueDay}
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
              min="1"
              max="31"
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
            >Add Account</button
          >
        </div>
      </form>
    </div>
  {/if}
</div>
