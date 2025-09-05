<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import {
    AccountForm,
    CategoryForm,
    TransactionForm,
    ProjectionsCarousel,
    CurrentMonthSummary,
    InstallmentDetails,
    FormDrawer,
  } from '$lib/components';
  import RecurrenceAdjustments from '$lib/components/finance/RecurrenceAdjustments.svelte';
  // Import new page components
  import FinancePageHeader from '$lib/components/finance/page/FinancePageHeader.svelte';
  import GettingStartedGuide from '$lib/components/finance/page/GettingStartedGuide.svelte';
  import BackupSection from '$lib/components/finance/page/BackupSection.svelte';
  import ActiveRecurrencesSection from '$lib/components/finance/page/ActiveRecurrencesSection.svelte';
  import ActiveInstallmentsSection from '$lib/components/finance/page/ActiveInstallmentsSection.svelte';
  import FloatingActionButton from '$lib/components/finance/page/FloatingActionButton.svelte';
  import {
    showError,
    showSuccess,
    showInfo,
    showWarning,
  } from '$lib/stores/toast';

  // Import helper functions
  import {
    getCategoryName,
    getAccountName,
    getInstallmentStatus,
    getInstallmentValues,
    getBalanceImpact,
    formatRecurrenceInterval,
    getCurrentMonthTransactions,
    getRecurrentTransactions,
    getInstallmentTransactions,
    getRegularTransactions,
    calculateTotalBalance,
  } from '$lib/helpers/financeHelpers';

  // Import action functions
  import {
    refreshProjections,
    debugData,
    exportBackup,
    importBackup,
    createDeleteTransactionEnhance,
  } from '$lib/helpers/financeActions';

  export let data;

  $: accounts = data.accounts;
  $: categories = data.categories;
  $: transactions = data.transactions;
  $: projections = data.projections;
  $: recurrenceAdjustments = data.recurrenceAdjustments;

  $: totalBalance = calculateTotalBalance(accounts);

  // Filtered transactions for different views using helpers
  $: recurrentTransactions = getRecurrentTransactions(transactions);
  $: installmentTransactions = getInstallmentTransactions(transactions);
  $: regularTransactions = getRegularTransactions(transactions);

  // Tab state for transactions section
  let activeTransactionsTab = 'current'; // 'current' or 'all'

  // Drawer state
  let showFormDrawer = false;
  let activeForm = 'account'; // 'account', 'category', or 'transaction'

  // FAB (Floating Action Button) state
  let showFABMenu = false;

  // Form visibility states (kept for FormDrawer)
  let showAccountForm = false;
  let showCategoryForm = false;
  let showTransactionForm = false;

  // Get current month transactions using helper
  $: currentMonthTransactions = getCurrentMonthTransactions(transactions);

  // Local helper functions that call imported helpers with bound parameters
  function getCategoryNameBound(categoryId: string) {
    return getCategoryName(categoryId, categories);
  }

  function getAccountNameBound(accountId: string) {
    return getAccountName(accountId, accounts);
  }

  // Drawer functions (agora vazio, pois todos são modais)
  function closeFormDrawer() {
    showFormDrawer = false;
    showAccountForm = false;
    showCategoryForm = false;
    showTransactionForm = false;
  }

  // Funções específicas para abrir modais
  function openTransactionModal() {
    showTransactionForm = true;
  }

  function openAccountModal() {
    showAccountForm = true;
  }

  function openCategoryModal() {
    showCategoryForm = true;
  }

  // FAB (Floating Action Button) functions
  function toggleFABMenu() {
    showFABMenu = !showFABMenu;
  }

  function openFormDrawerFromFAB(
    formType: 'account' | 'category' | 'transaction'
  ) {
    showFABMenu = false; // Close FAB menu

    if (formType === 'transaction') {
      openTransactionModal();
    } else if (formType === 'account') {
      openAccountModal();
    } else if (formType === 'category') {
      openCategoryModal();
    }
  }

  // Helper function for delete transaction enhance
  function deleteTransactionEnhance() {
    return createDeleteTransactionEnhance();
  }
</script>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-6xl mx-auto px-4">
    <!-- Page Header Component -->
    <FinancePageHeader />

    <CurrentMonthSummary
      {totalBalance}
      {projections}
      {transactions}
      {categories}
    />

    <!-- Getting Started Guide Component -->
    <GettingStartedGuide {accounts} {categories} />

    <!-- Backup Section Component -->
    <BackupSection {data} />

    <!-- Active Recurrences Section Component -->
    <ActiveRecurrencesSection {recurrentTransactions} {categories} {accounts} />

    <!-- Active Installments Section Component -->
    <ActiveInstallmentsSection
      {installmentTransactions}
      {categories}
      {accounts}
    />

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
                      {@const installmentStatus =
                        getInstallmentStatus(transaction)}
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
                      class="text-red-500 text-sm hover:underline"
                      >Delete</button
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
                      {@const installmentStatus =
                        getInstallmentStatus(transaction)}
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
                      class="text-red-500 text-sm hover:underline"
                      >Delete</button
                    >
                  </form>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <!-- Projections Section -->
    <ProjectionsCarousel
      {projections}
      {formatRecurrenceInterval}
      onRefreshProjections={refreshProjections}
      onDebugData={debugData}
    />

    <!-- Recurrence Adjustments Section -->
    <RecurrenceAdjustments {projections} {recurrenceAdjustments} />
  </div>
</section>

<!-- Floating Action Button Component -->
<FloatingActionButton
  bind:showFABMenu
  {toggleFABMenu}
  {openFormDrawerFromFAB}
/>

<!-- Form Drawer -->
<FormDrawer bind:show={showFormDrawer} on:close={closeFormDrawer}>
  <!-- Drawer agora vazio, todos são modais -->
</FormDrawer>

<!-- Modals independentes -->
<AccountForm {accounts} bind:showForm={showAccountForm} />
<CategoryForm {categories} bind:showForm={showCategoryForm} />
<TransactionForm {accounts} {categories} bind:showForm={showTransactionForm} />
