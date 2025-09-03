<script lang="ts">
  import { scale, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let totalBalance: number;
  export let projections: any[];
  export let transactions: any[];
  export let categories: any[];

  const currentDate = new Date();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Find current month projection
  $: currentProjection = projections.find(
    (p: any) => p.month === currentMonth && p.year === currentYear
  );

  // Calculate current month transactions
  $: currentMonthTransactions = transactions.filter((transaction: any) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Calculate actual income and expenses for current month
  $: actualIncome = currentMonthTransactions
    .filter((t: any) => {
      const category = categories.find((c: any) => c.id === t.category_id);
      return category?.type === 'INCOME';
    })
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  $: actualExpenses = currentMonthTransactions
    .filter((t: any) => {
      const category = categories.find((c: any) => c.id === t.category_id);
      return category?.type === 'EXPENSE';
    })
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  $: netFlow = actualIncome - Math.abs(actualExpenses);

  // Calculate remaining days in month
  $: lastDayOfMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0
  ).getDate();
  $: remainingDays = lastDayOfMonth - currentDate.getDate();

  // Progress through month
  $: monthProgress = (currentDate.getDate() / lastDayOfMonth) * 100;
</script>

<div
  class="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl shadow-lg mb-8"
  in:scale={{ duration: 600, easing: quintOut, start: 0.95 }}
>
  <!-- Header with month info -->
  <div
    class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl"
  >
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold">{currentMonth} {currentYear}</h2>
        <p class="text-blue-100 text-lg">Current Financial Overview</p>
      </div>
      <div class="text-right">
        <div class="text-4xl font-bold">
          ${totalBalance.toFixed(2)}
        </div>
        <div class="text-sm text-blue-200">Total Balance</div>
      </div>
    </div>

    <!-- Show if no data is available -->
    {#if projections.length === 0 && transactions.length === 0}
      <div class="mt-4 bg-blue-800/20 rounded-lg p-4 text-center">
        <div class="text-blue-200 text-sm">
          📊 No financial data available yet. Start by adding accounts,
          categories, and transactions!
        </div>
      </div>
    {/if}

    <!-- Month progress bar -->
    <div class="mt-4">
      <div class="flex justify-between text-sm text-blue-200 mb-2">
        <span>Month Progress</span>
        <span>{remainingDays} days remaining</span>
      </div>
      <div class="w-full bg-blue-800/30 rounded-full h-3">
        <div
          class="bg-white h-3 rounded-full transition-all duration-500"
          style="width: {monthProgress}%"
        ></div>
      </div>
    </div>
  </div>

  <!-- Current month stats -->
  <div class="p-6">
    {#if projections.length === 0 && transactions.length === 0 && categories.length === 0}
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
          Once you have data, this section will show detailed insights about {currentMonth}
          {currentYear}
        </div>
      </div>
    {:else}
      <!-- Has some data -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Actual Income -->
        <div
          class="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
          in:fly={{ y: 20, duration: 400, delay: 100 }}
        >
          <div class="text-2xl mb-2">💰</div>
          <h3
            class="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1"
          >
            Actual Income
          </h3>
          <p class="text-2xl font-bold text-green-800">
            +${actualIncome.toFixed(2)}
          </p>
          {#if currentProjection}
            <p class="text-xs text-green-600 mt-1">
              of ${currentProjection.total_income.toFixed(2)} projected
            </p>
          {/if}
        </div>

        <!-- Actual Expenses -->
        <div
          class="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
          in:fly={{ y: 20, duration: 400, delay: 200 }}
        >
          <div class="text-2xl mb-2">💸</div>
          <h3
            class="text-sm font-semibold text-red-700 uppercase tracking-wide mb-1"
          >
            Actual Expenses
          </h3>
          <p class="text-2xl font-bold text-red-800">
            -${Math.abs(actualExpenses).toFixed(2)}
          </p>
          {#if currentProjection}
            <p class="text-xs text-red-600 mt-1">
              of ${currentProjection.total_expenses.toFixed(2)} projected
            </p>
          {/if}
        </div>

        <!-- Net Flow -->
        <div
          class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
          in:fly={{ y: 20, duration: 400, delay: 300 }}
        >
          <div class="text-2xl mb-2">
            {#if netFlow >= 0}
              📈
            {:else}
              📉
            {/if}
          </div>
          <h3
            class="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-1"
          >
            Net Flow
          </h3>
          <p
            class="text-2xl font-bold"
            class:text-green-800={netFlow >= 0}
            class:text-red-800={netFlow < 0}
          >
            {netFlow >= 0 ? '+' : ''}${netFlow.toFixed(2)}
          </p>
          {#if currentProjection}
            {@const projectedFlow =
              currentProjection.total_income - currentProjection.total_expenses}
            <p class="text-xs text-blue-600 mt-1">
              vs ${projectedFlow.toFixed(2)} projected
            </p>
          {/if}
        </div>
      </div>

      <!-- Transactions summary -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h4
            class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <span>📊</span>
            This Month's Activity
          </h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Transactions:</span>
              <span class="font-semibold"
                >{currentMonthTransactions.length}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Income Transactions:</span>
              <span class="font-semibold text-green-700">
                {currentMonthTransactions.filter((t: any) => {
                  const category = categories.find(
                    (c: any) => c.id === t.category_id
                  );
                  return category?.type === 'INCOME';
                }).length}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Expense Transactions:</span>
              <span class="font-semibold text-red-700">
                {currentMonthTransactions.filter((t: any) => {
                  const category = categories.find(
                    (c: any) => c.id === t.category_id
                  );
                  return category?.type === 'EXPENSE';
                }).length}
              </span>
            </div>
          </div>
        </div>

        {#if currentProjection}
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h4
              class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <span>🔮</span>
              Projection vs Reality
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Income Progress:</span>
                <span class="font-semibold">
                  {currentProjection.total_income > 0
                    ? (
                        (actualIncome / currentProjection.total_income) *
                        100
                      ).toFixed(1)
                    : '0'}%
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Expense Progress:</span>
                <span class="font-semibold">
                  {currentProjection.total_expenses > 0
                    ? (
                        (actualExpenses / currentProjection.total_expenses) *
                        100
                      ).toFixed(1)
                    : '0'}%
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Projected End Balance:</span>
                <span
                  class="font-semibold"
                  class:text-green-700={currentProjection.projected_balance >=
                    0}
                  class:text-red-700={currentProjection.projected_balance < 0}
                >
                  ${currentProjection.projected_balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
