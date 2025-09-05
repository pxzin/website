// Monthly Calculations Helper Functions

export interface MonthlyStats {
  actualIncome: number;
  actualExpenses: number;
  netFlow: number;
}

export interface AdvancedStats {
  savingRate: number;
  burnRate: number;
  dailyAverageSpending: number;
  projectedMonthEndSpending: number;
}

export interface FinancialInsight {
  icon: string;
  title: string;
  description: string;
}

export interface CategoryData {
  [key: string]: {
    income: number;
    expenses: number;
  };
}

export interface MonthInfo {
  currentMonth: string;
  currentYear: number;
  remainingDays: number;
}

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

export function getCurrentMonthInfo(): MonthInfo {
  const currentDate = new Date();
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const lastDayOfMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const remainingDays = lastDayOfMonth - currentDate.getDate();

  return { currentMonth, currentYear, remainingDays };
}

export function getCurrentMonthTransactions(transactions: any[]): any[] {
  const currentDate = new Date();
  return transactions.filter((transaction: any) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });
}

export function getCurrentMonthProjection(projections: any[]): any | null {
  const currentDate = new Date();
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    projections.find(
      (p: any) => p.month === currentMonth && p.year === currentYear
    ) || null
  );
}

export function calculateMonthlyStats(
  currentMonthTransactions: any[]
): MonthlyStats {
  const actualIncome = currentMonthTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => {
      if (t.installments_total && t.installments_total > 1) {
        return sum + t.amount / t.installments_total;
      }
      return sum + t.amount;
    }, 0);

  const actualExpenses = currentMonthTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => {
      if (t.installments_total && t.installments_total > 1) {
        return sum + t.amount / t.installments_total;
      }
      return sum + t.amount;
    }, 0);

  const netFlow = actualIncome - Math.abs(actualExpenses);

  return { actualIncome, actualExpenses, netFlow };
}

export function calculateMonthProgress(): number {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const lastDayOfMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0
  ).getDate();
  return (currentDate.getDate() / lastDayOfMonth) * 100;
}

export function calculateAdvancedStats(
  actualIncome: number,
  actualExpenses: number,
  totalBalance: number,
  currentDate: Date
): AdvancedStats {
  const savingRate =
    actualIncome > 0
      ? ((actualIncome - Math.abs(actualExpenses)) / actualIncome) * 100
      : 0;

  const burnRate =
    Math.abs(actualExpenses) > 0
      ? totalBalance / (Math.abs(actualExpenses) / currentDate.getDate())
      : 0;

  const dailyAverageSpending = Math.abs(actualExpenses) / currentDate.getDate();

  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const projectedMonthEndSpending = dailyAverageSpending * lastDayOfMonth;

  return {
    savingRate,
    burnRate,
    dailyAverageSpending,
    projectedMonthEndSpending,
  };
}

export function generateFinancialInsights(
  currentMonthTransactions: any[],
  actualIncome: number,
  actualExpenses: number,
  totalBalance: number,
  savingRate: number,
  burnRate: number,
  currentProjection: any | null
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  if (savingRate > 20) {
    insights.push({
      icon: '💰',
      title: 'Excellent Savings Rate',
      description: `You're saving ${savingRate.toFixed(
        1
      )}% of your income this month!`,
    });
  } else if (savingRate < 0) {
    insights.push({
      icon: '⚠️',
      title: 'Spending More Than Earning',
      description: `You're spending ${Math.abs(savingRate).toFixed(
        1
      )}% more than you're earning this month.`,
    });
  }

  if (burnRate > 0 && burnRate < 30) {
    insights.push({
      icon: '🔥',
      title: 'Low Cash Runway',
      description: `At current spending, you have about ${burnRate.toFixed(
        0
      )} days of cash left.`,
    });
  }

  if (
    currentProjection &&
    actualExpenses > currentProjection.total_expenses * 0.8
  ) {
    insights.push({
      icon: '⚡',
      title: 'Approaching Budget Limit',
      description: `You've used ${(
        (actualExpenses / currentProjection.total_expenses) *
        100
      ).toFixed(1)}% of your projected expenses.`,
    });
  }

  if (currentMonthTransactions.length > 50) {
    insights.push({
      icon: '📊',
      title: 'High Transaction Volume',
      description: `You have ${currentMonthTransactions.length} transactions this month. Consider tracking patterns.`,
    });
  }

  return insights;
}

export function getCategoryBreakdown(
  currentMonthTransactions: any[],
  categories: any[]
): CategoryData {
  const breakdown: CategoryData = {};

  categories.forEach((category: any) => {
    const categoryTransactions = currentMonthTransactions.filter(
      (t: any) => t.category_id === category.id
    );

    if (categoryTransactions.length === 0) return;

    const income = categoryTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => {
        if (t.installments_total && t.installments_total > 1) {
          return sum + t.amount / t.installments_total;
        }
        return sum + t.amount;
      }, 0);

    const expenses = categoryTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => {
        if (t.installments_total && t.installments_total > 1) {
          return sum + t.amount / t.installments_total;
        }
        return sum + t.amount;
      }, 0);

    if (income > 0 || expenses < 0) {
      breakdown[category.name] = { income, expenses };
    }
  });

  return breakdown;
}

export function getRecentTransactions(currentMonthTransactions: any[]): any[] {
  return currentMonthTransactions
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);
}
