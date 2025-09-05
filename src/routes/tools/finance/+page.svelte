<script lang="ts">
  import {
    AccountForm,
    CategoryForm,
    TransactionForm,
    ProjectionsCarousel,
    CurrentMonthSummary,
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
  import TransactionsList from '$lib/components/finance/page/TransactionsList.svelte';

  // Import helper functions
  import {
    getRecurrentTransactions,
    getInstallmentTransactions,
    calculateTotalBalance,
    formatRecurrenceInterval,
  } from '$lib/helpers/financeHelpers';

  // Import action functions
  import { refreshProjections, debugData } from '$lib/helpers/financeActions';

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

  // Drawer state
  let showFormDrawer = false;

  // FAB (Floating Action Button) state
  let showFABMenu = false;

  // Form visibility states (kept for FormDrawer)
  let showAccountForm = false;
  let showCategoryForm = false;
  let showTransactionForm = false;

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

  // Function to dynamically change favicon
  function changeFavicon() {
    if (typeof document !== 'undefined') {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach((favicon) => favicon.remove());

      // Add new favicon
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = '/images/tools/fintrack-favicon.png';
      document.head.appendChild(newFavicon);
    }
  }

  // Function to restore default favicon
  function restoreDefaultFavicon() {
    if (typeof document !== 'undefined') {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach((favicon) => favicon.remove());

      // Add default favicon
      const defaultFavicon = document.createElement('link');
      defaultFavicon.rel = 'icon';
      defaultFavicon.href = '/favicon.png';
      document.head.appendChild(defaultFavicon);
    }
  }

  // Change favicon when component mounts and restore when destroyed
  import { onMount, onDestroy } from 'svelte';
  onMount(() => {
    changeFavicon();
  });

  onDestroy(() => {
    restoreDefaultFavicon();
  });
</script>

<svelte:head>
  <title>FinTrack - Financial Management Tool</title>
  <link
    rel="icon"
    type="image/png"
    sizes="32x32"
    href="/images/tools/fintrack-favicon.png"
  />
  <link
    rel="icon"
    type="image/png"
    sizes="16x16"
    href="/images/tools/fintrack-favicon.png"
  />
  <link rel="shortcut icon" href="/images/tools/fintrack-favicon.png" />
</svelte:head>

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

    <!-- Transactions List Component -->
    <TransactionsList {transactions} {categories} {accounts} />

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
