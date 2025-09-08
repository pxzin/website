// Monthly Calculations Helper Functions

export interface MonthlyStats {
  actualIncome: number;
  actualExpenses: number;
  netFlow: number;
  // New fields for better credit card handling
  expensesIncurred: number; // All expenses recorded, regardless of account type
  cashFlowImpact: number; // Only expenses that actually affected cash flow
  creditCardExpenses: number; // Expenses on credit cards not yet paid
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

/**
 * Calculate monthly installment impact for a specific month
 */
function calculateMonthlyInstallmentImpact(
  transactions: any[],
  targetMonth: number,
  targetYear: number,
  accounts?: any[]
): { totalImpact: number; creditCardImpact: number } {
  let totalImpact = 0;
  let creditCardImpact = 0;

  const installmentTransactions = transactions.filter(
    (tx) => tx.installments_total && tx.installments_total > 1
  );

  installmentTransactions.forEach((tx) => {
    const startDate = new Date(tx.installment_start_date || tx.date);
    const totalInstallments = tx.installments_total;
    const amountPerInstallment = Math.abs(tx.amount / totalInstallments);

    // Check each potential installment
    for (let i = 0; i < totalInstallments; i++) {
      const installmentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        startDate.getDate()
      );

      // If this installment is due in the target month
      if (
        installmentDate.getMonth() === targetMonth &&
        installmentDate.getFullYear() === targetYear
      ) {
        totalImpact += amountPerInstallment;

        // Check if it's a credit card transaction
        if (accounts) {
          const account = accounts.find((acc) => acc.id === tx.account_id);
          if (account?.type === 'CREDIT_CARD') {
            creditCardImpact += amountPerInstallment;
          }
        }
      }
    }
  });

  return { totalImpact, creditCardImpact };
}

export function calculateMonthlyStats(
  currentMonthTransactions: any[],
  accounts?: any[],
  allTransactions?: any[]
): MonthlyStats {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate income and expenses from current month transactions
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

  // Calculate installment impact for current month from ALL transactions
  const installmentData = allTransactions
    ? calculateMonthlyInstallmentImpact(
        allTransactions,
        currentMonth,
        currentYear,
        accounts
      )
    : { totalImpact: 0, creditCardImpact: 0 };

  // Calculate expenses incurred (all expenses from current month + installments due this month)
  const directExpenses = Math.abs(actualExpenses);
  const installmentExpenses = installmentData.totalImpact;
  const expensesIncurred = directExpenses + installmentExpenses;

  // Calculate credit card expenses using actual account balance
  const creditCardExpenses = accounts
    ? accounts
        .filter((acc: any) => acc.type === 'CREDIT_CARD')
        .reduce((sum: number, acc: any) => {
          // For credit cards, use the absolute value of the negative balance
          // This represents the amount currently owed on the card
          return sum + Math.abs(Math.min(0, acc.current_balance));
        }, 0)
    : 0;

  // Calculate cash flow impact (expenses that actually affected available cash)
  const cashFlowImpact = expensesIncurred - creditCardExpenses;

  const netFlow = actualIncome - expensesIncurred;

  return {
    actualIncome,
    actualExpenses,
    netFlow,
    expensesIncurred,
    cashFlowImpact,
    creditCardExpenses,
  };
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
