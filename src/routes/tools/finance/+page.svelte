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
  import {
    showError,
    showSuccess,
    showInfo,
    showWarning,
  } from '$lib/stores/toast';
  export let data;

  $: accounts = data.accounts;
  $: categories = data.categories;
  $: transactions = data.transactions;
  $: projections = data.projections;
  $: recurrenceAdjustments = data.recurrenceAdjustments;

  $: totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);

  // Filtered transactions for different views
  $: recurrentTransactions = transactions.filter((tx) => tx.is_recurrent);
  $: installmentTransactions = transactions.filter(
    (tx) => tx.installments_total
  );
  $: regularTransactions = transactions.filter(
    (tx) => !tx.is_recurrent && !tx.installments_total
  );

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

  // Get current month transactions
  $: currentMonthTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const now = new Date();
    return (
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear()
    );
  });

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

  function getInstallmentValues(transaction: any) {
    if (!transaction.installments_total) return null;

    const totalAmount = Math.abs(transaction.amount);
    const installmentValue = totalAmount / transaction.installments_total;
    const paidInstallments = transaction.installments_paid || 0;
    const remainingInstallments =
      transaction.installments_total - paidInstallments;

    const totalPaid = installmentValue * paidInstallments;
    const totalRemaining = installmentValue * remainingInstallments;

    return {
      installmentValue,
      totalPaid,
      totalRemaining,
      paidInstallments,
      remainingInstallments,
      totalInstallments: transaction.installments_total,
      isComplete: paidInstallments >= transaction.installments_total,
    };
  }

  // Function to get the actual balance impact (installment amount for installments)
  function getBalanceImpact(transaction: any) {
    if (transaction.installments_total && transaction.installments_total > 1) {
      return transaction.amount / transaction.installments_total;
    }
    return transaction.amount;
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

  // Drawer functions
  function openFormDrawer(formType: 'account' | 'category' | 'transaction') {
    activeForm = formType;
    showFormDrawer = true;

    // Reset all form states
    showAccountForm = false;
    showCategoryForm = false;
    showTransactionForm = false;

    // Show the requested form
    if (formType === 'account') showAccountForm = true;
    else if (formType === 'category') showCategoryForm = true;
    else if (formType === 'transaction') showTransactionForm = true;
  }

  function closeFormDrawer() {
    showFormDrawer = false;
    showAccountForm = false;
    showCategoryForm = false;
    showTransactionForm = false;
  }

  // FAB (Floating Action Button) functions
  function toggleFABMenu() {
    showFABMenu = !showFABMenu;
  }

  function openFormDrawerFromFAB(
    formType: 'account' | 'category' | 'transaction'
  ) {
    showFABMenu = false; // Close FAB menu
    openFormDrawer(formType);
  }

  function closeFABMenu() {
    showFABMenu = false;
  }

  // Close FAB menu when clicking outside
  function handleDocumentClick(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.fab-container')) {
      closeFABMenu();
    }
  }

  // Helper function for delete transaction enhance
  function deleteTransactionEnhance() {
    return ({ formData }) => {
      return async ({ result }) => {
        if (result.type === 'failure') {
          showError(result.data?.error || 'Failed to delete transaction');
        } else if (result.type === 'success') {
          showSuccess('Transaction deleted successfully');
          await invalidateAll();
        }
      };
    };
  }

  // Refresh projections function
  async function refreshProjections() {
    try {
      const formData = new FormData();
      const response = await fetch('?/refreshProjections', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showSuccess('Projections refreshed successfully!');
        await invalidateAll();
      } else {
        showError('Failed to refresh projections');
      }
    } catch (error) {
      console.error('Error refreshing projections:', error);
      showError('Failed to refresh projections');
    }
  }

  // Debug data function
  async function debugData() {
    try {
      const formData = new FormData();
      const response = await fetch('?/debugData', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.type === 'success') {
          showInfo(result.data.message);
          console.log('Debug data:', result.data.counts);
        } else {
          showError('Failed to debug data');
        }
      } else {
        showError('Failed to debug data');
      }
    } catch (error) {
      console.error('Error debugging data:', error);
      showError('Failed to debug data');
    }
  }

  // Backup functions
  async function exportBackup() {
    try {
      showInfo('Creating backup...');

      const response = await fetch('/tools/finance/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'export' }),
      });

      if (response.ok) {
        const result = await response.json();

        // Create and download the backup file
        const blob = new Blob([result.backup], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess('Backup exported successfully!');
      } else {
        const result = await response.json();
        showError(result?.error || 'Failed to export backup');
      }
    } catch (error) {
      showError('Failed to export backup');
      console.error(error);
    }
  }

  async function importBackup() {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          // First, preview the backup content
          const fileText = await file.text();
          let backup;

          try {
            backup = JSON.parse(fileText);
          } catch (parseError) {
            showError('Invalid JSON file. Please select a valid backup file.');
            return;
          }

          // Validate and show preview
          if (
            !backup.data ||
            !backup.data.accounts ||
            !backup.data.categories ||
            !backup.data.transactions
          ) {
            showError(
              "Invalid backup file structure. This doesn't appear to be a valid backup file."
            );
            return;
          }

          const previewMessage = `📊 Backup Preview:
• Created: ${backup.timestamp ? new Date(backup.timestamp).toLocaleDateString() : 'Unknown'}
• Version: ${backup.version || 'Unknown'}
• Accounts: ${backup.data.accounts.length}
• Categories: ${backup.data.categories.length}
• Transactions: ${backup.data.transactions.length}

⚠️ This will REPLACE ALL existing data!`;

          const confirmed = confirm(
            previewMessage + '\n\nDo you want to continue?'
          );
          if (!confirmed) return;

          const doubleConfirm = prompt(
            '⚠️ FINAL WARNING: Type "RESTORE BACKUP" to confirm complete data replacement:'
          );
          if (doubleConfirm !== 'RESTORE BACKUP') {
            showInfo('Operation cancelled - confirmation text did not match');
            return;
          }

          showWarning('Importing backup and clearing existing data...');

          const formData = new FormData();
          formData.append('backupFile', file);

          const response = await fetch('/tools/finance?/importBackup', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            showSuccess(result.message || 'Backup imported successfully!');
            setTimeout(() => window.location.reload(), 2000);
          } else {
            const result = await response.json();
            showError(result?.error || 'Failed to import backup');
          }
        } catch (error) {
          showError('Failed to process backup file');
          console.error(error);
        }
      };

      input.click();
    } catch (error) {
      showError('Failed to open file dialog');
      console.error(error);
    }
  }
</script>

<!-- Global event listeners -->
<svelte:window on:click={handleDocumentClick} />

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

    <CurrentMonthSummary
      {totalBalance}
      {projections}
      {transactions}
      {categories}
    />

    <!-- Getting Started Guide -->
    {#if accounts.length === 0 && categories.length === 0}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div class="text-center">
          <div class="text-4xl mb-4">🚀</div>
          <h3 class="text-xl font-semibold text-blue-900 mb-3">
            Welcome to Your Financial Tool!
          </h3>
          <p class="text-blue-700 mb-4">
            Get started by setting up your accounts and categories:
          </p>
          <div class="grid md:grid-cols-3 gap-4 text-sm">
            <div class="bg-white p-4 rounded-lg border border-blue-200">
              <div class="text-2xl mb-2">🏦</div>
              <h4 class="font-semibold mb-1">1. Add Accounts</h4>
              <p class="text-gray-600">
                Create accounts for your bank, credit cards, and cash.
              </p>
            </div>
            <div class="bg-white p-4 rounded-lg border border-blue-200">
              <div class="text-2xl mb-2">📂</div>
              <h4 class="font-semibold mb-1">2. Create Categories</h4>
              <p class="text-gray-600">
                Organize your income and expenses into categories.
              </p>
            </div>
            <div class="bg-white p-4 rounded-lg border border-blue-200">
              <div class="text-2xl mb-2">💸</div>
              <h4 class="font-semibold mb-1">3. Add Transactions</h4>
              <p class="text-gray-600">
                Track your financial movements and see projections.
              </p>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Backup & Data Management Section -->
    <div
      class="bg-gray-50 p-6 rounded-lg shadow-md mb-8 border-l-4 border-gray-500"
    >
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">
        💾 Backup & Data Management
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>📥</span>
            Export Backup
          </h3>
          <p class="text-sm text-gray-600 mb-3">
            Download a complete backup of all your financial data as a JSON
            file.
          </p>
          <button
            on:click={exportBackup}
            class="bg-emerald-500 text-white px-4 py-2 rounded text-sm hover:bg-emerald-600 transition-colors w-full"
          >
            📥 Export Backup
          </button>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>📤</span>
            Import Backup
          </h3>
          <p class="text-sm text-gray-600 mb-3">
            Restore all data from a backup file. This will replace all existing
            data.
          </p>
          <button
            on:click={importBackup}
            class="bg-amber-500 text-white px-4 py-2 rounded text-sm hover:bg-amber-600 transition-colors border-2 border-amber-300 w-full"
          >
            📤 Import Backup
          </button>
        </div>
      </div>
      <div class="mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded">
        <p><strong>💡 Backup Tips:</strong></p>
        <p>
          • Export creates a timestamped JSON file with all your accounts,
          categories, and transactions
        </p>
        <p>
          • Import will completely replace all existing data - make sure to
          export first!
        </p>
        <p>• Keep regular backups to protect your financial data</p>
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
                <InstallmentDetails
                  transaction={installment}
                  categoryType={getCategoryType(installment.category_id)}
                />

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
                      class:text-green-500={getCategoryType(
                        transaction.category_id
                      ) === 'INCOME'}
                      class:text-red-500={getCategoryType(
                        transaction.category_id
                      ) === 'EXPENSE'}
                    >
                      {#if getCategoryType(transaction.category_id) === 'EXPENSE'}
                        -${Math.abs(getBalanceImpact(transaction)).toFixed(2)}
                      {:else}
                        +${getBalanceImpact(transaction).toFixed(2)}
                      {/if}
                    </div>
                    {#if transaction.installments_total && transaction.installments_total > 1}
                      <div class="text-xs text-gray-500">
                        Total: {#if getCategoryType(transaction.category_id) === 'EXPENSE'}-{/if}${Math.abs(
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
                      class:text-green-500={getCategoryType(
                        transaction.category_id
                      ) === 'INCOME'}
                      class:text-red-500={getCategoryType(
                        transaction.category_id
                      ) === 'EXPENSE'}
                    >
                      {#if getCategoryType(transaction.category_id) === 'EXPENSE'}
                        -${Math.abs(getBalanceImpact(transaction)).toFixed(2)}
                      {:else}
                        +${getBalanceImpact(transaction).toFixed(2)}
                      {/if}
                    </div>
                    {#if transaction.installments_total && transaction.installments_total > 1}
                      <div class="text-xs text-gray-500">
                        Total: {#if getCategoryType(transaction.category_id) === 'EXPENSE'}-{/if}${Math.abs(
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
      {getCategoryType}
      {formatRecurrenceInterval}
      onRefreshProjections={refreshProjections}
      onDebugData={debugData}
    />

    <!-- Recurrence Adjustments Section -->
    <RecurrenceAdjustments {projections} {recurrenceAdjustments} />
  </div>
</section>

<!-- Floating Action Button -->
<!-- Subtle backdrop when FAB menu is open -->
{#if showFABMenu}
  <div
    class="fixed inset-0 z-20 bg-black/10 backdrop-blur-sm transition-all duration-300"
  ></div>
{/if}

<div class="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30 fab-container">
  <!-- FAB Menu Options -->
  {#if showFABMenu}
    <div
      class="absolute bottom-16 right-0 space-y-3 transition-all duration-300 transform"
    >
      <!-- Add Transaction -->
      <div class="animate-in slide-in-from-right-5 duration-300 delay-0">
        <button
          on:click={() => openFormDrawerFromFAB('transaction')}
          class="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <span class="mr-2">💰</span>
          <span class="text-xs md:text-sm font-medium whitespace-nowrap"
            >Add Transaction</span
          >
        </button>
      </div>

      <!-- Add Category -->
      <div class="animate-in slide-in-from-right-5 duration-300 delay-75">
        <button
          on:click={() => openFormDrawerFromFAB('category')}
          class="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <span class="mr-2">🏷️</span>
          <span class="text-xs md:text-sm font-medium whitespace-nowrap"
            >Add Category</span
          >
        </button>
      </div>

      <!-- Add Account -->
      <div class="animate-in slide-in-from-right-5 duration-300 delay-150">
        <button
          on:click={() => openFormDrawerFromFAB('account')}
          class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <span class="mr-2">🏦</span>
          <span class="text-xs md:text-sm font-medium whitespace-nowrap"
            >Add Account</span
          >
        </button>
      </div>
    </div>
  {/if}

  <!-- Main FAB Button -->
  <button
    on:click={toggleFABMenu}
    class="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group transform hover:scale-110"
    aria-label="Quick Actions"
  >
    <span
      class="text-xl md:text-2xl transition-transform duration-300"
      class:rotate-45={showFABMenu}
    >
      {showFABMenu ? '✕' : '+'}
    </span>
  </button>
</div>

<!-- Form Drawer -->
<FormDrawer bind:show={showFormDrawer} on:close={closeFormDrawer}>
  {#if showAccountForm}
    <AccountForm {accounts} bind:showForm={showAccountForm} />
  {:else if showCategoryForm}
    <CategoryForm {categories} bind:showForm={showCategoryForm} />
  {:else if showTransactionForm}
    <TransactionForm
      {accounts}
      {categories}
      bind:showForm={showTransactionForm}
    />
  {/if}
</FormDrawer>
