<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;

  let newAccountName = '';
  let newAccountType = 'CHECKING';
  let newAccountInitialBalance = 0;
  let newAccountCreditLimit: number | null = null;
  let newAccountDueDay: number | null = null;

  let newCategoryName = '';
  let newCategoryType = 'EXPENSE';

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

  $: accounts = data.accounts;
  $: categories = data.categories;
  $: transactions = data.transactions;
  $: projections = data.projections;

  $: totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);

  function resetAccountForm() {
    newAccountName = '';
    newAccountType = 'CHECKING';
    newAccountInitialBalance = 0;
    newAccountCreditLimit = null;
    newAccountDueDay = null;
  }

  function resetCategoryForm() {
    newCategoryName = '';
    newCategoryType = 'EXPENSE';
  }

  function resetTransactionForm() {
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
  }

  function getCategoryName(categoryId: string) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  function getAccountName(accountId: string) {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown';
  }

</script>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-6xl mx-auto px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-[var(--color-primary-default)]">Financial Overview</h1>
      <form method="POST" action="/login?/logout" use:enhance>
        <button type="submit" class="text-sm text-gray-600 hover:text-primary-default">Logout</button>
      </form>
    </div>

    <div class="mb-8 text-center">
      <h2 class="text-3xl font-semibold">Current Total Balance: <span class="text-[var(--color-primary-accent)]">${totalBalance.toFixed(2)}</span></h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      <!-- Accounts Section -->
      <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Accounts</h2>
        <ul class="space-y-2 mb-4">
          {#each accounts as account}
            <li class="flex justify-between items-center">
              <span>{account.name} ({account.type}):</span>
              <span class="font-medium">${account.current_balance.toFixed(2)}</span>
            </li>
          {/each}
        </ul>
        <form method="POST" action="?/addAccount" use:enhance on:submit={resetAccountForm}>
          <h3 class="text-xl font-semibold mb-2">Add New Account</h3>
          <input type="text" name="name" placeholder="Account Name" bind:value={newAccountName} class="w-full p-2 border rounded mb-2" required />
          <select name="type" bind:value={newAccountType} class="w-full p-2 border rounded mb-2">
            <option value="CHECKING">Checking</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="CASH">Cash</option>
          </select>
          <input type="number" name="initial_balance" placeholder="Initial Balance" bind:value={newAccountInitialBalance} class="w-full p-2 border rounded mb-2" step="0.01" required />
          {#if newAccountType === 'CREDIT_CARD'}
            <input type="number" name="credit_limit" placeholder="Credit Limit" bind:value={newAccountCreditLimit} class="w-full p-2 border rounded mb-2" step="0.01" />
            <input type="number" name="due_day" placeholder="Due Day (1-31)" bind:value={newAccountDueDay} class="w-full p-2 border rounded mb-2" min="1" max="31" />
          {/if}
          <button type="submit" class="w-full bg-[var(--color-primary-accent)] text-white p-2 rounded hover:bg-opacity-90">Add Account</button>
        </form>
      </div>

      <!-- Categories Section -->
      <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Categories</h2>
        <ul class="space-y-2 mb-4">
          {#each categories as category}
            <li>{category.name} ({category.type})</li>
          {/each}
        </ul>
        <form method="POST" action="?/addCategory" use:enhance on:submit={resetCategoryForm}>
          <h3 class="text-xl font-semibold mb-2">Add New Category</h3>
          <input type="text" name="name" placeholder="Category Name" bind:value={newCategoryName} class="w-full p-2 border rounded mb-2" required />
          <select name="type" bind:value={newCategoryType} class="w-full p-2 border rounded mb-2">
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <button type="submit" class="w-full bg-[var(--color-primary-accent)] text-white p-2 rounded hover:bg-opacity-90">Add Category</button>
        </form>
      </div>

      <!-- Add Transaction Section -->
      <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Add Transaction</h2>
        <form method="POST" action="?/addTransaction" use:enhance on:submit={resetTransactionForm}>
          <input type="text" name="description" placeholder="Description" bind:value={newTransactionDescription} class="w-full p-2 border rounded mb-2" required />
          <input type="number" name="amount" placeholder="Amount" bind:value={newTransactionAmount} class="w-full p-2 border rounded mb-2" step="0.01" required />
          <input type="date" name="date" bind:value={newTransactionDate} class="w-full p-2 border rounded mb-2" required />
          <select name="account_id" bind:value={newTransactionAccountId} class="w-full p-2 border rounded mb-2" required>
            <option value="">Select Account</option>
            {#each accounts as account}
              <option value={account.id}>{account.name}</option>
            {/each}
          </select>
          <select name="category_id" bind:value={newTransactionCategoryId} class="w-full p-2 border rounded mb-2" required>
            <option value="">Select Category</option>
            {#each categories as category}
              <option value={category.id}>{category.name} ({category.type})</option>
            {/each}
          </select>
          
          <label class="flex items-center mb-2">
            <input type="checkbox" name="is_recurrent" bind:checked={newTransactionIsRecurrent} class="mr-2" />
            Recurrent Transaction
          </label>
          {#if newTransactionIsRecurrent}
            <select name="recurrence_interval" bind:value={newTransactionRecurrenceInterval} class="w-full p-2 border rounded mb-2">
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          {/if}

          <label class="flex items-center mb-2">
            Installment Transaction
            <input type="number" name="installments_total" placeholder="Total Installments" bind:value={newTransactionInstallmentsTotal} class="ml-2 p-2 border rounded w-1/2" min="1" />
          </label>
          {#if newTransactionInstallmentsTotal}
            <input type="number" name="installments_paid" placeholder="Installments Paid" bind:value={newTransactionInstallmentsPaid} class="w-full p-2 border rounded mb-2" min="0" />
            <input type="date" name="installment_start_date" bind:value={newTransactionInstallmentStartDate} class="w-full p-2 border rounded mb-2" />
          {/if}

          <button type="submit" class="w-full bg-[var(--color-primary-accent)] text-white p-2 rounded hover:bg-opacity-90">Add Transaction</button>
        </form>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold mb-4">Transactions</h2>
      <ul class="space-y-2">
        {#each transactions as transaction}
          <li class="flex justify-between items-center p-2 border-b border-gray-200 last:border-b-0">
            <div>
              <span class="font-medium">{transaction.description}</span><br/>
              <span class="text-sm text-gray-600">{getCategoryName(transaction.category_id)} - {getAccountName(transaction.account_id)} ({transaction.date})</span>
            </div>
            <span class="font-semibold" class:text-red-500={transaction.amount < 0} class:text-green-500={transaction.amount >= 0}>${transaction.amount.toFixed(2)}</span>
          </li>
        {/each}
      </ul>
    </div>

    <!-- Projections Section -->
    <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Projections</h2>
      <div class="space-y-4">
        {#each projections as projection}
          <div class="border p-4 rounded-lg">
            <h3 class="text-xl font-semibold mb-2">{projection.month} {projection.year}</h3>
            <p class="mb-2">Projected Balance: <span class="font-bold" class:text-red-500={projection.projected_balance < 0} class:text-green-500={projection.projected_balance >= 0}>${projection.projected_balance.toFixed(2)}</span></p>
            <h4 class="text-lg font-medium mb-1">Transactions for this month:</h4>
            <ul class="list-disc list-inside">
              {#each projection.transactions as tx}
                <li>{tx.description} - ${tx.amount.toFixed(2)}</li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>

  </div>
</section>
