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

export function calculateProjections(
  accounts: Account[],
  transactions: Transaction[],
  monthsToProject: number = 6
): ProjectionMonth[] {
  const projections: ProjectionMonth[] = [];

  // Start with the current total balance from all accounts
  let projectedBalance = accounts.reduce(
    (sum, acc) => sum + acc.current_balance,
    0
  );

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  for (let i = 0; i < monthsToProject; i++) {
    // Start projections from next month (i+1)
    const projectionMonth = currentMonth + i + 1;
    const projectionYear = currentYear + Math.floor(projectionMonth / 12);
    const adjustedMonth = projectionMonth % 12;

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

    // Calculate account-specific balances (simplified - distributed proportionally)
    const accountBalances: {
      [accountId: string]: { name: string; balance: number; change: number };
    } = {};
    const totalCurrentBalance = accounts.reduce(
      (sum, acc) => sum + acc.current_balance,
      0
    );

    accounts.forEach((account) => {
      const proportion =
        totalCurrentBalance > 0
          ? account.current_balance / totalCurrentBalance
          : 1 / accounts.length;
      const accountChange = monthlyNet * proportion;
      const accountBalance = account.current_balance + accountChange * (i + 1); // Progressive change over months

      accountBalances[account.id] = {
        name: account.name,
        balance: accountBalance,
        change: accountChange,
      };
    });

    projections.push({
      month: monthName,
      year: currentYear,
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
