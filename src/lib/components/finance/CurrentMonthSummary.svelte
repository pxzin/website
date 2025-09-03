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
    .reduce((sum: number, t: any) => {
      // For installments, use the monthly amount instead of total amount
      if (t.installments_total && t.installments_total > 1) {
        return sum + t.amount / t.installments_total;
      }
      return sum + t.amount;
    }, 0);

  $: actualExpenses = currentMonthTransactions
    .filter((t: any) => {
      const category = categories.find((c: any) => c.id === t.category_id);
      return category?.type === 'EXPENSE';
    })
    .reduce((sum: number, t: any) => {
      // For installments, use the monthly amount instead of total amount
      if (t.installments_total && t.installments_total > 1) {
        return sum + t.amount / t.installments_total;
      }
      return sum + t.amount;
    }, 0);

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

  // Advanced Statistics
  $: savingRate =
    actualIncome > 0
      ? ((actualIncome - Math.abs(actualExpenses)) / actualIncome) * 100
      : 0;

  $: burnRate =
    Math.abs(actualExpenses) > 0
      ? totalBalance / (Math.abs(actualExpenses) / currentDate.getDate())
      : 0;

  // Daily average spending
  $: dailyAverageSpending = Math.abs(actualExpenses) / currentDate.getDate();

  // Projected month-end spending based on current pace
  $: projectedMonthEndSpending = dailyAverageSpending * lastDayOfMonth;

  // Get previous month data for comparison
  $: previousMonth =
    currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
  $: previousYear =
    currentDate.getMonth() === 0 ? currentYear - 1 : currentYear;
  $: previousMonthTransactions = transactions.filter((transaction: any) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === previousMonth &&
      transactionDate.getFullYear() === previousYear
    );
  });

  $: previousMonthExpenses = previousMonthTransactions
    .filter((t: any) => {
      const category = categories.find((c: any) => c.id === t.category_id);
      return category?.type === 'EXPENSE';
    })
    .reduce((sum: number, t: any) => {
      if (t.installments_total && t.installments_total > 1) {
        return sum + t.amount / t.installments_total;
      }
      return sum + t.amount;
    }, 0);

  // Calculate spending change from previous month
  $: spendingChange =
    previousMonthExpenses !== 0
      ? ((Math.abs(actualExpenses) - Math.abs(previousMonthExpenses)) /
          Math.abs(previousMonthExpenses)) *
        100
      : 0;

  // Find biggest expense this month
  $: biggestExpense = currentMonthTransactions
    .filter((t: any) => {
      const category = categories.find((c: any) => c.id === t.category_id);
      return category?.type === 'EXPENSE';
    })
    .reduce((max: any, t: any) => {
      const amount = Math.abs(
        t.installments_total && t.installments_total > 1
          ? t.amount / t.installments_total
          : t.amount
      );
      const maxAmount = Math.abs(
        max?.installments_total && max?.installments_total > 1
          ? max.amount / max.installments_total
          : max?.amount || 0
      );
      return amount > maxAmount ? t : max;
    }, null);

  // Calculate expense distribution by category
  $: expensesByCategory = categories
    .filter((c: any) => c.type === 'EXPENSE')
    .map((category: any) => {
      const categoryExpenses = currentMonthTransactions
        .filter((t: any) => t.category_id === category.id)
        .reduce((sum: number, t: any) => {
          if (t.installments_total && t.installments_total > 1) {
            return sum + Math.abs(t.amount / t.installments_total);
          }
          return sum + Math.abs(t.amount);
        }, 0);
      return {
        ...category,
        amount: categoryExpenses,
        percentage:
          Math.abs(actualExpenses) > 0
            ? (categoryExpenses / Math.abs(actualExpenses)) * 100
            : 0,
      };
    })
    .filter((c: any) => c.amount > 0)
    .sort((a: any, b: any) => b.amount - a.amount);

  // Weekly spending pattern
  $: weeklySpending = currentMonthTransactions
    .filter((t: any) => {
      const category = categories.find((c: any) => c.id === t.category_id);
      return category?.type === 'EXPENSE';
    })
    .reduce((weeks: any[], t: any) => {
      const transactionDate = new Date(t.date);
      const weekNumber = Math.ceil(transactionDate.getDate() / 7);
      const amount = Math.abs(
        t.installments_total && t.installments_total > 1
          ? t.amount / t.installments_total
          : t.amount
      );

      const existingWeek = weeks.find((w) => w.week === weekNumber);
      if (existingWeek) {
        existingWeek.amount += amount;
      } else {
        weeks.push({ week: weekNumber, amount });
      }
      return weeks;
    }, [])
    .sort((a: any, b: any) => a.week - b.week);

  // Smart Insights
  $: smartInsights = (() => {
    const insights = [];

    // High saving rate insight
    if (savingRate >= 30) {
      insights.push({
        type: 'positive',
        icon: '🌟',
        message: `Excellent saving rate of ${savingRate.toFixed(1)}%! You're building wealth effectively.`,
      });
    } else if (savingRate < 0) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        message:
          "You're spending more than earning this month. Consider reviewing your expenses.",
      });
    }

    // Spending trend insight
    if (spendingChange > 25) {
      insights.push({
        type: 'warning',
        icon: '📈',
        message: `Spending increased ${spendingChange.toFixed(0)}% from last month. Check if this was planned.`,
      });
    } else if (spendingChange < -15) {
      insights.push({
        type: 'positive',
        icon: '📉',
        message: `Great job! You reduced spending by ${Math.abs(spendingChange).toFixed(0)}% from last month.`,
      });
    }

    // Burn rate insight
    if (burnRate > 0 && burnRate < 30) {
      insights.push({
        type: 'warning',
        icon: '⏰',
        message: `Your current balance would last ${Math.floor(burnRate)} days at current spending pace.`,
      });
    }

    // Category concentration insight
    if (
      expensesByCategory.length > 0 &&
      expensesByCategory[0].percentage > 50
    ) {
      insights.push({
        type: 'info',
        icon: '🎯',
        message: `${expensesByCategory[0].name} represents ${expensesByCategory[0].percentage.toFixed(0)}% of your expenses. Consider diversifying.`,
      });
    }

    // Weekly pattern insight
    if (weeklySpending.length >= 3) {
      const maxWeek = weeklySpending.reduce((max, week) =>
        week.amount > max.amount ? week : max
      );
      const minWeek = weeklySpending.reduce((min, week) =>
        week.amount < min.amount ? week : min
      );
      if (maxWeek.amount > minWeek.amount * 2) {
        insights.push({
          type: 'info',
          icon: '📊',
          message: `Week ${maxWeek.week} had the highest spending (${maxWeek.amount.toFixed(0)}). Look for patterns to optimize.`,
        });
      }
    }

    return insights.slice(0, 3); // Show max 3 insights
  })();
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

      <!-- Advanced Statistics Section -->
      {#if currentMonthTransactions.length > 0}
        <div class="mt-6 space-y-4">
          <!-- Financial Performance Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Saving Rate -->
            <div
              class="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-lg p-4 text-center"
            >
              <div class="text-xl mb-2">💎</div>
              <h4
                class="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1"
              >
                Saving Rate
              </h4>
              <p
                class="text-lg font-bold"
                class:text-emerald-700={savingRate >= 20}
                class:text-orange-700={savingRate >= 0 && savingRate < 20}
                class:text-red-700={savingRate < 0}
              >
                {savingRate.toFixed(1)}%
              </p>
              <p class="text-xs text-emerald-600 mt-1">
                {savingRate >= 30
                  ? 'Excellent!'
                  : savingRate >= 20
                    ? 'Good'
                    : savingRate >= 0
                      ? 'Fair'
                      : 'Deficit'}
              </p>
            </div>

            <!-- Burn Rate -->
            <div
              class="bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 rounded-lg p-4 text-center"
            >
              <div class="text-xl mb-2">⏳</div>
              <h4
                class="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1"
              >
                Burn Rate
              </h4>
              <p class="text-lg font-bold text-amber-700">
                {burnRate > 0 ? `${Math.floor(burnRate)} days` : '∞'}
              </p>
              <p class="text-xs text-amber-600 mt-1">Balance duration</p>
            </div>

            <!-- Daily Average -->
            <div
              class="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-lg p-4 text-center"
            >
              <div class="text-xl mb-2">📅</div>
              <h4
                class="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1"
              >
                Daily Average
              </h4>
              <p class="text-lg font-bold text-purple-700">
                ${dailyAverageSpending.toFixed(2)}
              </p>
              <p class="text-xs text-purple-600 mt-1">Per day spending</p>
            </div>
          </div>

          <!-- Insights and Trends -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Spending Analysis -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h4
                class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
              >
                <span>🔍</span>
                Spending Analysis
              </h4>
              <div class="space-y-3 text-sm">
                {#if previousMonthExpenses !== 0}
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">vs Last Month:</span>
                    <span
                      class="font-semibold flex items-center gap-1"
                      class:text-green-600={spendingChange < 0}
                      class:text-red-600={spendingChange > 0}
                      class:text-gray-600={spendingChange === 0}
                    >
                      {spendingChange >= 0 ? '↗️' : '↘️'}
                      {Math.abs(spendingChange).toFixed(1)}%
                    </span>
                  </div>
                {/if}

                <div class="flex justify-between">
                  <span class="text-gray-600">Projected Month-End:</span>
                  <span class="font-semibold text-orange-700">
                    ${projectedMonthEndSpending.toFixed(2)}
                  </span>
                </div>

                {#if biggestExpense}
                  <div class="flex justify-between">
                    <span class="text-gray-600">Biggest Expense:</span>
                    <span class="font-semibold text-red-700">
                      ${(biggestExpense.installments_total &&
                      biggestExpense.installments_total > 1
                        ? Math.abs(
                            biggestExpense.amount /
                              biggestExpense.installments_total
                          )
                        : Math.abs(biggestExpense.amount)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 truncate">
                    {biggestExpense.description}
                  </div>
                {/if}
              </div>
            </div>

            <!-- Category Breakdown -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h4
                class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
              >
                <span>📊</span>
                Top Categories
              </h4>
              <div class="space-y-2">
                {#each expensesByCategory.slice(0, 4) as category}
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <div class="w-2 h-2 rounded-full bg-red-400"></div>
                      <span class="text-sm text-gray-700 truncate"
                        >{category.name}</span
                      >
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-medium text-gray-500">
                        {category.percentage.toFixed(0)}%
                      </span>
                      <span class="text-sm font-semibold text-red-700">
                        ${category.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1">
                    <div
                      class="bg-red-400 h-1 rounded-full transition-all duration-300"
                      style="width: {category.percentage}%"
                    ></div>
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Weekly Spending Pattern -->
          {#if weeklySpending.length > 1}
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h4
                class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
              >
                <span>📈</span>
                Weekly Spending Pattern
              </h4>
              <div class="flex items-end justify-between gap-2 h-20">
                {#each weeklySpending as week}
                  <div class="flex-1 flex flex-col items-center">
                    <div
                      class="w-full bg-blue-200 rounded-t transition-all duration-300 hover:bg-blue-300"
                      style="height: {Math.max(
                        (week.amount /
                          Math.max(...weeklySpending.map((w) => w.amount))) *
                          60,
                        8
                      )}px"
                      title="Week {week.week}: ${week.amount.toFixed(2)}"
                    ></div>
                    <div class="text-xs text-gray-500 mt-1">W{week.week}</div>
                    <div class="text-xs font-medium text-gray-700">
                      ${week.amount.toFixed(0)}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Smart Insights -->
          {#if smartInsights.length > 0}
            <div
              class="bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200 rounded-lg p-4"
            >
              <h4
                class="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2"
              >
                <span>🧠</span>
                Smart Insights
              </h4>
              <div class="space-y-3">
                {#each smartInsights as insight}
                  <div
                    class="flex items-start gap-3 p-3 rounded-lg"
                    class:bg-green-50={insight.type === 'positive'}
                    class:bg-yellow-50={insight.type === 'warning'}
                    class:bg-blue-50={insight.type === 'info'}
                  >
                    <div class="text-lg">{insight.icon}</div>
                    <p
                      class="text-sm flex-1"
                      class:text-green-700={insight.type === 'positive'}
                      class:text-yellow-700={insight.type === 'warning'}
                      class:text-blue-700={insight.type === 'info'}
                    >
                      {insight.message}
                    </p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</div>
