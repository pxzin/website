<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { showError, showSuccess } from '$lib/stores/toast';
  import Modal from '$lib/components/Modal.svelte';

  export let accounts: any[] = [];
  export let showForm = false;

  // Group accounts by type
  $: accountsByType = accounts.reduce(
    (groups, account) => {
      const type = account.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(account);
      return groups;
    },
    {} as Record<string, any[]>
  );

  let newAccountName = '';
  let newAccountType = 'CHECKING';
  let newAccountInitialBalance = 0;
  let newAccountCreditLimit: number | null = null;
  let newAccountDueDay: number | null = null;

  // Edit mode state
  let editingAccount: any = null;
  let editAccountName = '';
  let editAccountInitialBalance = 0;

  function resetForm() {
    newAccountName = '';
    newAccountType = 'CHECKING';
    newAccountInitialBalance = 0;
    newAccountCreditLimit = null;
    newAccountDueDay = null;
    showForm = false;
  }

  function handleClose() {
    showForm = false;
    cancelEdit();
  }

  function startEdit(account: any) {
    editingAccount = account;
    editAccountName = account.name;
    editAccountInitialBalance = account.initial_balance;
  }

  function cancelEdit() {
    editingAccount = null;
    editAccountName = '';
    editAccountInitialBalance = 0;
  }
</script>

<!-- Modal para adicionar conta -->
<Modal bind:show={showForm} on:close={handleClose} maxWidth="max-w-md">
  <svelte:fragment slot="header">
    <div class="flex items-center gap-3">
      <span class="text-2xl">🏦</span>
      <h2 class="text-xl font-semibold text-gray-900">Add Account</h2>
    </div>
  </svelte:fragment>

  <form
    method="POST"
    action="?/addAccount"
    use:enhance={({ formData }) => {
      return async ({ result }: any) => {
        if (result.type === 'failure') {
          showError(result.data?.error || 'Failed to add account');
        } else if (result.type === 'success') {
          showSuccess('Account added successfully');
          resetForm();
          await invalidateAll();
        }
      };
    }}
    class="space-y-4"
  >
    <div>
      <label
        for="account-name"
        class="block text-sm font-medium text-gray-700 mb-1">Account Name</label
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
        class="block text-sm font-medium text-gray-700 mb-1">Account Type</label
      >
      <select
        id="account-type"
        name="type"
        bind:value={newAccountType}
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
      >
        <option value="CHECKING">🏦 Checking Account</option>
        <option value="SAVINGS">🏛️ Savings Account</option>
        <option value="CREDIT_CARD">💳 Credit Card</option>
        <option value="INVESTMENT">📈 Investment Account</option>
        <option value="BUSINESS">🏢 Business Account</option>
        <option value="CASH">💰 Cash</option>
        <option value="CRYPTO">₿ Cryptocurrency</option>
        <option value="LOAN">🏠 Loan Account</option>
        <option value="PENSION">🎯 Pension/Retirement</option>
        <option value="OTHER">📋 Other</option>
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
        step="0.01"
        name="initialBalance"
        placeholder="0.00"
        bind:value={newAccountInitialBalance}
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
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
          step="0.01"
          name="creditLimit"
          placeholder="e.g., 5000.00"
          bind:value={newAccountCreditLimit}
          class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
        />
      </div>
      <div>
        <label
          for="due-day"
          class="block text-sm font-medium text-gray-700 mb-1">Due Day</label
        >
        <select
          id="due-day"
          name="dueDay"
          bind:value={newAccountDueDay}
          class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
        >
          <option value={null}>Select due day</option>
          {#each Array.from({ length: 31 }, (_, i) => i + 1) as day}
            <option value={day}>{day}</option>
          {/each}
        </select>
      </div>
    {/if}

    <div class="flex gap-2 pt-4">
      <button
        type="submit"
        class="flex-1 px-4 py-2 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Add Account
      </button>
      <button
        type="button"
        on:click={handleClose}
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200"
      >
        Cancel
      </button>
    </div>
  </form>
</Modal>

<!-- Lista de contas -->
<div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2
          class="text-2xl font-semibold flex items-center gap-2 text-gray-900"
        >
          <span>🏦</span>
          Accounts Overview
        </h2>
        <p class="text-sm text-gray-600 mt-1">
          {accounts.length} account{accounts.length !== 1 ? 's' : ''} • Total balance:
          ${accounts
            .reduce((sum, acc) => sum + acc.current_balance, 0)
            .toFixed(2)}
        </p>
      </div>
      <button
        type="button"
        on:click={() => (showForm = true)}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
      >
        <span>➕</span>
        Add Account
      </button>
    </div>

    {#if accounts.length === 0}
      <div class="text-center py-12 text-gray-500">
        <div class="text-6xl mb-4">🏦</div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">No accounts yet</h3>
        <p class="text-sm mb-4">
          Add your first account to start tracking your finances
        </p>
        <button
          type="button"
          on:click={() => (showForm = true)}
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          <span>➕</span>
          Create First Account
        </button>
      </div>
    {:else}
      <!-- Account Type Groups -->
      <div class="space-y-6">
        {#each Object.entries(accountsByType) as [type, typeAccounts]}
          <div>
            <h3
              class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2"
            >
              <span class="text-lg">
                {#if type === 'CHECKING'}
                  🏦
                {:else if type === 'SAVINGS'}
                  🏛️
                {:else if type === 'CREDIT_CARD'}
                  💳
                {:else if type === 'INVESTMENT'}
                  📈
                {:else if type === 'BUSINESS'}
                  🏢
                {:else if type === 'CASH'}
                  💰
                {:else if type === 'CRYPTO'}
                  ₿
                {:else if type === 'LOAN'}
                  🏠
                {:else if type === 'PENSION'}
                  🎯
                {:else}
                  📋
                {/if}
              </span>
              {type.replace('_', ' ')} ({typeAccounts.length})
            </h3>
            <div class="grid gap-3">
              {#each typeAccounts as account}
                {#if editingAccount && editingAccount.id === account.id}
                  <!-- Edit mode -->
                  <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <form
                      method="POST"
                      action="?/updateAccount"
                      use:enhance={({ formData }) => {
                        return async ({ result }: any) => {
                          if (result.type === 'failure') {
                            showError(
                              result.data?.error || 'Failed to update account'
                            );
                          } else if (result.type === 'success') {
                            showSuccess('Account updated successfully');
                            cancelEdit();
                            await invalidateAll();
                          }
                        };
                      }}
                      class="space-y-3"
                    >
                      <input
                        type="hidden"
                        name="accountId"
                        value={account.id}
                      />

                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Account Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            bind:value={editAccountName}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Initial Balance
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="initialBalance"
                            bind:value={editAccountInitialBalance}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-600">
                          Current: ${account.current_balance.toFixed(2)}
                          → Will become: ${(
                            account.current_balance +
                            (editAccountInitialBalance -
                              account.initial_balance)
                          ).toFixed(2)}
                        </div>
                        <div class="flex gap-2">
                          <button
                            type="button"
                            on:click={cancelEdit}
                            class="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                {:else}
                  <!-- View mode -->
                  <div
                    class="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200 group"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-3 h-3 rounded-full {account.current_balance >=
                        0
                          ? 'bg-green-400'
                          : 'bg-red-400'}"
                      ></div>
                      <div>
                        <div class="font-medium text-gray-900">
                          {account.name}
                        </div>
                        <div class="text-xs text-gray-500">
                          Initial: ${account.initial_balance.toFixed(2)}
                          {#if account.type === 'CREDIT_CARD' && account.credit_limit}
                            • Credit Limit: ${account.credit_limit.toFixed(2)}
                            {#if account.due_day}
                              • Due: Day {account.due_day}
                            {/if}
                          {/if}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="text-right">
                        <div
                          class="font-semibold text-lg {account.current_balance >=
                          0
                            ? 'text-green-600'
                            : 'text-red-600'}"
                        >
                          ${account.current_balance.toFixed(2)}
                        </div>
                        {#if account.type === 'CREDIT_CARD' && account.credit_limit}
                          <div class="text-xs text-gray-500">
                            {Math.round(
                              (Math.abs(account.current_balance) /
                                account.credit_limit) *
                                100
                            )}% used
                          </div>
                        {/if}
                      </div>

                      <div
                        class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <button
                          type="button"
                          on:click={() => startEdit(account)}
                          class="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                          title="Edit account"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                            />
                          </svg>
                        </button>

                        <form
                          method="POST"
                          action="?/deleteAccount"
                          use:enhance={({ formData }) => {
                            return async ({ result }: any) => {
                              if (result.type === 'failure') {
                                showError(
                                  result.data?.error ||
                                    'Failed to delete account'
                                );
                              } else if (result.type === 'success') {
                                showSuccess('Account deleted successfully');
                                await invalidateAll();
                              }
                            };
                          }}
                        >
                          <input
                            type="hidden"
                            name="accountId"
                            value={account.id}
                          />
                          <button
                            type="submit"
                            class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                            title="Delete account"
                          >
                            <svg
                              class="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
