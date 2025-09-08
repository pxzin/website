<script lang="ts">
  import MonthlyHeader from './monthly/MonthlyHeader.svelte';
  import MonthlyStatsCards from './monthly/MonthlyStatsCards.svelte';
  import FinancialInsights from './monthly/FinancialInsights.svelte';
  import {
    getCurrentMonthTransactions,
    calculateMonthlyStats,
    getCurrentMonthProjection,
    generateFinancialInsights,
    calculateMonthProgress,
    calculateAdvancedStats,
    getCurrentMonthInfo,
  } from '$lib/helpers/monthlyCalculations';

  export let totalBalance: number;
  export let projections: any[];
  export let transactions: any[];
  export let categories: any[];
  export let accounts: any[] = []; // Add accounts prop

  const currentDate = new Date();

  // Calculate all derived data using utility functions
  $: currentProjection = getCurrentMonthProjection(projections);
  $: currentMonthTransactions = getCurrentMonthTransactions(transactions);
  $: monthlyStats = calculateMonthlyStats(
    currentMonthTransactions,
    accounts,
    transactions
  );
  $: actualIncome = monthlyStats.actualIncome;
  $: actualExpenses = monthlyStats.actualExpenses;
  $: netFlow = monthlyStats.netFlow;
  $: expensesIncurred = monthlyStats.expensesIncurred;
  $: cashFlowImpact = monthlyStats.cashFlowImpact;
  $: creditCardExpenses = monthlyStats.creditCardExpenses;
  $: monthProgress = calculateMonthProgress();
  $: monthInfo = getCurrentMonthInfo();
  $: remainingDays = monthInfo.remainingDays;
  $: advancedStats = calculateAdvancedStats(
    actualIncome,
    actualExpenses,
    totalBalance,
    currentDate
  );
  $: savingRate = advancedStats.savingRate;
  $: burnRate = advancedStats.burnRate;
  $: dailyAverageSpending = advancedStats.dailyAverageSpending;
  $: insights = generateFinancialInsights(
    currentMonthTransactions,
    actualIncome,
    actualExpenses,
    totalBalance,
    savingRate,
    burnRate,
    currentProjection
  );
</script>

<div class="bg-white border border-gray-200 rounded-lg p-0 shadow-sm">
  <!-- Monthly Header -->
  <MonthlyHeader
    {totalBalance}
    {monthProgress}
    {remainingDays}
    {transactions}
  />

  <!-- Current month stats -->
  <div class="p-6">
    {#if transactions.length === 0 && categories.length === 0}
      <!-- No data state -->
      <div class="text-center py-8">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          Welcome to Your Financial Dashboard!
        </h3>
        <p class="text-gray-600 mb-4">
          Get started by adding your first account, category, and transaction
          below.
        </p>
        <div class="text-sm text-gray-500">
          Once you have data, this section will show detailed insights about the
          current month.
        </div>
      </div>
    {:else}
      <!-- Monthly Stats Cards -->
      <MonthlyStatsCards
        {actualIncome}
        {actualExpenses}
        {netFlow}
        {currentProjection}
        {expensesIncurred}
        {cashFlowImpact}
        {creditCardExpenses}
      />

      <!-- Financial Insights -->
      <div class="mt-6">
        <FinancialInsights {insights} />
      </div>
    {/if}
  </div>
</div>
