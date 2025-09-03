import crypto from 'crypto';

export interface Account {
  id: string;
  name: string;
  type: string;
  initial_balance: number;
  current_balance: number;
  credit_limit: number | null;
  due_day: number | null;
}

export interface Category {
  id: string;
  name: string;
  type: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  account_id: string;
  category_id: string;
  is_recurrent: boolean;
  recurrence_interval: string | null;
  installments_total: number | null;
  installments_paid: number | null;
  installment_start_date: string | null;
  installment_number?: number; // Added for projections
}

export interface ProjectionMonth {
  month: string;
  year: number;
  projected_balance: number;
  previous_balance: number;
  balance_change: number;
  transactions: Transaction[];
  account_balances: {
    [accountId: string]: { name: string; balance: number; change: number };
  };
  total_income: number;
  total_expenses: number;
  net_change: number;
}

function calculateOptimalProjectionMonths(
  transactions: Transaction[],
  currentDate: Date
): number {
  let furthestMonth = 6; // Minimum 6 months

  // Find the furthest installment transaction
  transactions
    .filter((tx) => tx.installments_total && tx.installments_paid !== null)
    .forEach((tx) => {
      const startDate = new Date(tx.installment_start_date || tx.date);
      const totalInstallments = tx.installments_total || 0;
      const paidInstallments = tx.installments_paid || 0;

      // Calculate the month of the last installment
      const lastInstallmentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + totalInstallments - 1,
        startDate.getDate()
      );

      // Calculate months from current date to last installment
      const monthsDiff =
        (lastInstallmentDate.getFullYear() - currentDate.getFullYear()) * 12 +
        (lastInstallmentDate.getMonth() - currentDate.getMonth()) +
        1;

      if (monthsDiff > furthestMonth) {
        furthestMonth = monthsDiff;
      }
    });

  // Also check recurrent transactions (project at least 12 months for recurrent)
  const hasRecurrentTransactions = transactions.some((tx) => tx.is_recurrent);
  if (hasRecurrentTransactions && furthestMonth < 12) {
    furthestMonth = 12;
  }

  return Math.max(furthestMonth, 6); // Ensure minimum 6 months
}

export function calculateProjections(
  accounts: Account[],
  transactions: Transaction[],
  monthsToProject?: number,
  currentDate?: Date
): ProjectionMonth[] {
  const projections: ProjectionMonth[] = [];
  const today = currentDate || new Date();

  // Calculate optimal projection months if not provided
  const optimalMonths =
    monthsToProject || calculateOptimalProjectionMonths(transactions, today);

  // Start with the current total balance from all accounts
  let projectedBalance = accounts.reduce(
    (sum, acc) => sum + acc.current_balance,
    0
  );

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  for (let i = 0; i < optimalMonths; i++) {
    // Start projections from next month (i+1)
    const projectionMonth = currentMonth + i + 1;
    const adjustedMonth = projectionMonth % 12;
    const projectionYear = currentYear + Math.floor(projectionMonth / 12);

    const monthName = new Date(projectionYear, adjustedMonth).toLocaleString(
      'default',
      { month: 'long' }
    );
    const monthTransactions: Transaction[] = [];

    // Include future non-recurrent, non-installment transactions for this month
    transactions
      .filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          !tx.is_recurrent &&
          !tx.installments_total &&
          txDate.getMonth() === adjustedMonth &&
          txDate.getFullYear() === projectionYear
        );
      })
      .forEach((tx) => monthTransactions.push(tx));

    // Generate recurrent transactions for the projected month
    transactions
      .filter((tx) => tx.is_recurrent)
      .forEach((tx) => {
        const originalDate = new Date(tx.date);
        let shouldInclude = false;

        // Check if this recurrent transaction should appear in the projected month
        if (tx.recurrence_interval === 'MONTHLY') {
          // For monthly recurrence, include in every month
          shouldInclude = true;
        } else if (tx.recurrence_interval === 'YEARLY') {
          // For yearly recurrence, include only if it's the same month as the original transaction
          shouldInclude = originalDate.getMonth() === adjustedMonth;
        }

        if (shouldInclude) {
          const recurrentTx: Transaction = {
            ...tx,
            id: crypto.randomUUID(),
            date: new Date(
              projectionYear,
              adjustedMonth,
              originalDate.getDate()
            )
              .toISOString()
              .split('T')[0],
            is_recurrent: true, // Ensure this flag is maintained
          };
          monthTransactions.push(recurrentTx);
        }
      });

    // Generate installment transactions for the current projected month
    transactions
      .filter((tx) => tx.installments_total && tx.installments_paid !== null)
      .forEach((tx) => {
        const startDate = new Date(tx.installment_start_date || tx.date);
        const totalInstallments = tx.installments_total || 0;
        const paidInstallments = tx.installments_paid || 0;
        const amountPerInstallment = tx.amount / totalInstallments;

        // Iterate through all possible installments
        for (let k = 0; k < totalInstallments; k++) {
          const installmentDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth() + k,
            startDate.getDate()
          );

          // Only consider installments that are due in the current projected month AND are not yet paid
          if (
            installmentDate.getMonth() === adjustedMonth &&
            installmentDate.getFullYear() === projectionYear &&
            k >= paidInstallments
          ) {
            const installmentTx: Transaction = {
              ...tx,
              id: crypto.randomUUID(),
              amount: amountPerInstallment,
              date: installmentDate.toISOString().split('T')[0],
              installment_number: k + 1, // Current installment number
            };
            monthTransactions.push(installmentTx);
          }
        }
      });

    // Calculate net for the current month's projected transactions
    const monthlyNet = monthTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );

    // Calculate income and expenses
    const totalIncome = monthTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpenses = Math.abs(
      monthTransactions
        .filter((tx) => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0)
    );

    // Store previous balance before applying changes
    const previousBalance = projectedBalance;
    projectedBalance += monthlyNet;

    // Calculate account-specific balances properly
    const accountBalances: {
      [accountId: string]: { name: string; balance: number; change: number };
    } = {};

    // Initialize with current balances for first month, or use previous projection for subsequent months
    accounts.forEach((account) => {
      let currentAccountBalance = account.current_balance;

      // If this is not the first projection, get the balance from the previous month
      if (i > 0 && projections[i - 1]) {
        currentAccountBalance =
          projections[i - 1].account_balances[account.id]?.balance ||
          account.current_balance;
      }

      // Calculate the change for this specific account in this month
      const accountChange = monthTransactions
        .filter((tx) => tx.account_id === account.id)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const newAccountBalance = currentAccountBalance + accountChange;

      accountBalances[account.id] = {
        name: account.name,
        balance: newAccountBalance,
        change: accountChange,
      };
    });

    projections.push({
      month: monthName,
      year: projectionYear,
      projected_balance: projectedBalance,
      previous_balance: previousBalance,
      balance_change: monthlyNet,
      transactions: monthTransactions,
      account_balances: accountBalances,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_change: monthlyNet,
    });
  }

  return projections;
}
