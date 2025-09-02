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

  // Filtered transactions for different views
  $: recurrentTransactions = transactions.filter((tx) => tx.is_recurrent);
  $: installmentTransactions = transactions.filter(
    (tx) => tx.installments_total
  );
  $: regularTransactions = transactions.filter(
    (tx) => !tx.is_recurrent && !tx.installments_total
  );

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
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  function getCategoryType(categoryId: string) {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.type : 'UNKNOWN';
  }

  function getAccountName(accountId: string) {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : 'Unknown';
  }

  function getInstallmentStatus(transaction: any) {
    if (!transaction.installments_total) return null;

    const total = transaction.installments_total;
    const paid = transaction.installments_paid || 0;
    const remaining = total - paid;
    const percentage = Math.round((paid / total) * 100);

    return {
      total,
      paid,
      remaining,
      percentage,
      isComplete: paid >= total,
    };
  }

  function formatRecurrenceInterval(interval: string | null) {
    if (!interval) return '';
    switch (interval) {
      case 'MONTHLY':
        return 'Monthly';
      case 'YEARLY':
        return 'Yearly';
      default:
        return interval;
    }
  }
</script>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-6xl mx-auto px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-[var(--color-primary-default)]">
        Financial Overview
      </h1>
      <form method="POST" action="/login?/logout" use:enhance>
        <button
          type="submit"
          class="text-sm text-gray-600 hover:text-primary-default"
          >Logout</button
        >
      </form>
    </div>

    <div class="mb-8 text-center">
      <h2 class="text-3xl font-semibold">
        Current Total Balance: <span class="text-[var(--color-primary-accent)]"
          >${totalBalance.toFixed(2)}</span
        >
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      <!-- Accounts Section -->
      <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Accounts</h2>
        <ul class="space-y-2 mb-4">
          {#each accounts as account}
            <li class="flex justify-between items-center">
              <span>{account.name} ({account.type}):</span>
              <div class="flex items-center gap-2">
                <span class="font-medium"
                  >${account.current_balance.toFixed(2)}</span
                >
                <form
                  method="POST"
                  action="?/deleteAccount"
                  use:enhance
                  class="inline"
                >
                  <input type="hidden" name="accountId" value={account.id} />
                  <button
                    type="submit"
                    class="text-red-500 text-sm hover:underline">Delete</button
                  >
                </form>
              </div>
            </li>
          {/each}
        </ul>
        <form
          method="POST"
          action="?/addAccount"
          use:enhance
          on:submit={resetAccountForm}
        >
          <h3 class="text-xl font-semibold mb-2">Add New Account</h3>
          <input
            type="text"
            name="name"
            placeholder="Account Name"
            bind:value={newAccountName}
            class="w-full p-2 border rounded mb-2"
            required
          />
          <select
            name="type"
            bind:value={newAccountType}
            class="w-full p-2 border rounded mb-2"
          >
            <option value="CHECKING">Checking</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="CASH">Cash</option>
          </select>
          <input
            type="number"
            name="initialBalance"
            placeholder="Initial Balance"
            bind:value={newAccountInitialBalance}
            class="w-full p-2 border rounded mb-2"
            step="0.01"
            required
          />
          {#if newAccountType === 'CREDIT_CARD'}
            <input
              type="number"
              name="creditLimit"
              placeholder="Credit Limit"
              bind:value={newAccountCreditLimit}
              class="w-full p-2 border rounded mb-2"
              step="0.01"
            />
            <input
              type="number"
              name="dueDay"
              placeholder="Due Day (1-31)"
              bind:value={newAccountDueDay}
              class="w-full p-2 border rounded mb-2"
              min="1"
              max="31"
            />
          {/if}
          <button
            type="submit"
            class="w-full bg-[var(--color-primary-accent)] text-white p-2 rounded hover:bg-opacity-90"
            >Add Account</button
          >
        </form>
      </div>

      <!-- Categories Section -->
      <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Categories</h2>
        <ul class="space-y-2 mb-4">
          {#each categories as category}
            <li class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                {#if category.type === 'INCOME'}
                  <span class="text-green-600 font-bold">↗️</span>
                  <span class="text-green-700">{category.name}</span>
                  <span
                    class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                    >INCOME</span
                  >
                {:else}
                  <span class="text-red-600 font-bold">↘️</span>
                  <span class="text-red-700">{category.name}</span>
                  <span
                    class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                    >EXPENSE</span
                  >
                {/if}
              </div>
              <form
                method="POST"
                action="?/deleteCategory"
                use:enhance
                class="inline"
              >
                <input type="hidden" name="categoryId" value={category.id} />
                <button
                  type="submit"
                  class="text-red-500 text-sm hover:underline">Delete</button
                >
              </form>
            </li>
          {/each}
        </ul>
        <form
          method="POST"
          action="?/addCategory"
          use:enhance
          on:submit={resetCategoryForm}
        >
          <h3 class="text-xl font-semibold mb-2">Add New Category</h3>
          <input
            type="text"
            name="name"
            placeholder="Category Name"
            bind:value={newCategoryName}
            class="w-full p-2 border rounded mb-2"
            required
          />
          <select
            name="type"
            bind:value={newCategoryType}
            class="w-full p-2 border rounded mb-2"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <button
            type="submit"
            class="w-full bg-[var(--color-primary-accent)] text-white p-2 rounded hover:bg-opacity-90"
            >Add Category</button
          >
        </form>
      </div>

      <!-- Add Transaction Section -->
      <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Add Transaction</h2>
        <form
          method="POST"
          action="?/addTransaction"
          use:enhance
          on:submit={resetTransactionForm}
        >
          <input
            type="text"
            name="description"
            placeholder="Description"
            bind:value={newTransactionDescription}
            class="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            bind:value={newTransactionAmount}
            class="w-full p-2 border rounded mb-2"
            step="0.01"
            required
          />
          <input
            type="date"
            name="date"
            bind:value={newTransactionDate}
            class="w-full p-2 border rounded mb-2"
            required
          />
          <select
            name="accountId"
            bind:value={newTransactionAccountId}
            class="w-full p-2 border rounded mb-2"
            required
          >
            <option value="">Select Account</option>
            {#each accounts as account}
              <option value={account.id}>{account.name}</option>
            {/each}
          </select>
          <select
            name="categoryId"
            bind:value={newTransactionCategoryId}
            class="w-full p-2 border rounded mb-2"
            required
          >
            <option value="">Select Category</option>
            {#each categories as category}
              <option value={category.id}
                >{category.name} ({category.type})</option
              >
            {/each}
          </select>

          <label class="flex items-center mb-2">
            <input
              type="checkbox"
              name="isRecurrent"
              bind:checked={newTransactionIsRecurrent}
              class="mr-2"
            />
            Recurrent Transaction
          </label>
          {#if newTransactionIsRecurrent}
            <select
              name="recurrenceInterval"
              bind:value={newTransactionRecurrenceInterval}
              class="w-full p-2 border rounded mb-2"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          {/if}

          <label class="flex items-center mb-2">
            Installment Transaction
            <input
              type="number"
              name="installmentsTotal"
              placeholder="Total Installments"
              bind:value={newTransactionInstallmentsTotal}
              class="ml-2 p-2 border rounded w-1/2"
              min="1"
            />
          </label>
          {#if newTransactionInstallmentsTotal}
            <input
              type="number"
              name="installmentsPaid"
              placeholder="Installments Paid"
              bind:value={newTransactionInstallmentsPaid}
              class="w-full p-2 border rounded mb-2"
              min="0"
            />
            <input
              type="date"
              name="installmentStartDate"
              bind:value={newTransactionInstallmentStartDate}
              class="w-full p-2 border rounded mb-2"
            />
          {/if}

          <button
            type="submit"
            class="w-full bg-[var(--color-primary-accent)] text-white p-2 rounded hover:bg-opacity-90"
            >Add Transaction</button
          >
        </form>
      </div>
    </div>

    <!-- Active Recurrences Section -->
    {#if recurrentTransactions.length > 0}
      <div
        class="bg-purple-50 p-6 rounded-lg shadow-md mb-8 border-l-4 border-purple-500"
      >
        <h2 class="text-2xl font-semibold mb-4 text-purple-800">
          🔄 Active Recurrences
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each recurrentTransactions as recurrence}
            <div
              class="bg-white p-4 rounded-lg shadow-sm border border-purple-200"
            >
              <div class="flex items-center gap-2 mb-2">
                {#if getCategoryType(recurrence.category_id) === 'INCOME'}
                  <span class="text-green-600 font-bold">↗️</span>
                  <span class="font-medium text-green-700"
                    >{recurrence.description}</span
                  >
                {:else}
                  <span class="text-red-600 font-bold">↘️</span>
                  <span class="font-medium text-red-700"
                    >{recurrence.description}</span
                  >
                {/if}
              </div>

              <div class="text-sm text-gray-600 mb-2">
                {getCategoryName(recurrence.category_id)} • {getAccountName(
                  recurrence.account_id
                )}
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span
                    class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                  >
                    🔄 {formatRecurrenceInterval(
                      recurrence.recurrence_interval
                    )}
                  </span>
                  {#if getCategoryType(recurrence.category_id) === 'INCOME'}
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
                <div
                  class="font-semibold text-lg"
                  class:text-green-600={getCategoryType(
                    recurrence.category_id
                  ) === 'INCOME'}
                  class:text-red-600={getCategoryType(
                    recurrence.category_id
                  ) === 'EXPENSE'}
                >
                  {#if getCategoryType(recurrence.category_id) === 'EXPENSE'}
                    -${Math.abs(recurrence.amount).toFixed(2)}
                  {:else}
                    +${recurrence.amount.toFixed(2)}
                  {/if}
                </div>
              </div>

              <div class="mt-2 text-xs text-gray-500">
                Original Date: {recurrence.date}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

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
              <div
                class="bg-white p-4 rounded-lg shadow-sm border border-blue-200"
              >
                <div class="flex items-center gap-2 mb-2">
                  {#if getCategoryType(installment.category_id) === 'INCOME'}
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
                  {getCategoryName(installment.category_id)} • {getAccountName(
                    installment.account_id
                  )}
                </div>

                <!-- Progress Bar -->
                <div class="mb-2">
                  <div class="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{status.paid}/{status.total} parcelas</span>
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
                      📊 {status.remaining} restantes
                    </span>
                    {#if getCategoryType(installment.category_id) === 'INCOME'}
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
                      class:text-green-600={getCategoryType(
                        installment.category_id
                      ) === 'INCOME'}
                      class:text-red-600={getCategoryType(
                        installment.category_id
                      ) === 'EXPENSE'}
                    >
                      {#if getCategoryType(installment.category_id) === 'EXPENSE'}
                        -${Math.abs(installment.amount).toFixed(2)} total
                      {:else}
                        +${installment.amount.toFixed(2)} total
                      {/if}
                    </div>
                    <div class="text-xs text-gray-500">
                      {#if getCategoryType(installment.category_id) === 'EXPENSE'}
                        -${Math.abs(
                          installment.amount / installment.installments_total
                        ).toFixed(2)}/parcela
                      {:else}
                        +${(
                          installment.amount / installment.installments_total
                        ).toFixed(2)}/parcela
                      {/if}
                    </div>
                  </div>
                </div>

                <div class="mt-2 text-xs text-gray-500">
                  Start: {installment.installment_start_date ||
                    installment.date}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}

    <!-- Transactions List -->
    <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold mb-4">Transactions</h2>
      <ul class="space-y-2">
        {#each transactions as transaction}
          <li
            class="flex justify-between items-center p-3 border-b border-gray-200 last:border-b-0 bg-white rounded mb-2 shadow-sm"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                {#if getCategoryType(transaction.category_id) === 'INCOME'}
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
                {getCategoryName(transaction.category_id)} - {getAccountName(
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
                      📊 {installmentStatus.paid}/{installmentStatus.total} parcelas
                    </span>
                    <span
                      class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {installmentStatus.percentage}% pago
                    </span>
                    {#if installmentStatus.isComplete}
                      <span
                        class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                      >
                        ✅ Concluído
                      </span>
                    {:else}
                      <span
                        class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full"
                      >
                        ⏳ {installmentStatus.remaining} restantes
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
                  class:text-green-500={getCategoryType(
                    transaction.category_id
                  ) === 'INCOME'}
                  class:text-red-500={getCategoryType(
                    transaction.category_id
                  ) === 'EXPENSE'}
                >
                  {#if getCategoryType(transaction.category_id) === 'EXPENSE'}
                    -${Math.abs(transaction.amount).toFixed(2)}
                  {:else}
                    +${transaction.amount.toFixed(2)}
                  {/if}
                </div>
                {#if transaction.installments_total}
                  {@const installmentStatus = getInstallmentStatus(transaction)}
                  {#if installmentStatus}
                    <div class="text-xs text-gray-500">
                      {#if getCategoryType(transaction.category_id) === 'EXPENSE'}
                        -${Math.abs(
                          transaction.amount / transaction.installments_total
                        ).toFixed(2)}/parcela
                      {:else}
                        +${(
                          transaction.amount / transaction.installments_total
                        ).toFixed(2)}/parcela
                      {/if}
                    </div>
                  {/if}
                {/if}
              </div>
              <form
                method="POST"
                action="?/deleteTransaction"
                use:enhance
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
            <h4 class="text-lg font-medium mb-2">
              Transactions for this month:
            </h4>
            <ul class="space-y-2">
              {#each projection.transactions as tx}
                <li
                  class="flex items-center justify-between p-3 bg-white rounded border shadow-sm"
                >
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      {#if getCategoryType(tx.category_id) === 'INCOME'}
                        <span class="text-green-600 font-bold">↗️</span>
                        <span class="text-green-700 font-medium"
                          >{tx.description}</span
                        >
                        <span
                          class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                          >INCOME</span
                        >
                      {:else}
                        <span class="text-red-600 font-bold">↘️</span>
                        <span class="text-red-700 font-medium"
                          >{tx.description}</span
                        >
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
                          📊 Parcela {tx.installment_number}
                        </span>
                        {#if tx.installments_total}
                          <span
                            class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                          >
                            de {tx.installments_total}
                          </span>
                          <span
                            class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                          >
                            ({Math.round(
                              (tx.installment_number / tx.installments_total) *
                                100
                            )}% do total)
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
                    </div>
                    {#if tx.installment_number && tx.installments_total}
                      <div class="text-xs text-gray-500">
                        {#if getCategoryType(tx.category_id) === 'EXPENSE'}
                          Total: -${Math.abs(
                            tx.amount * tx.installments_total
                          ).toFixed(2)}
                        {:else}
                          Total: +${(tx.amount * tx.installments_total).toFixed(
                            2
                          )}
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
        {/each}
      </div>
    </div>
  </div>
</section>
