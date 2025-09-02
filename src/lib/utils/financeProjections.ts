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
  transactions: Transaction[];
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
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  for (let i = 0; i < monthsToProject; i++) {
    const monthName = new Date(currentYear, currentMonth).toLocaleString(
      'default',
      { month: 'long' }
    );
    const monthTransactions: Transaction[] = [];

    // For the current month (i=0), include only non-recurrent and non-installment transactions
    // that are in the current month. These represent one-time transactions that haven't happened yet
    // or need to be projected for this month.
    if (i === 0) {
      transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            !tx.is_recurrent &&
            !tx.installments_total &&
            txDate.getMonth() === currentMonth &&
            txDate.getFullYear() === currentYear
          );
        })
        .forEach((tx) => monthTransactions.push(tx));
    }

    // Generate recurrent transactions for the current projected month
    transactions
      .filter((tx) => tx.is_recurrent)
      .forEach((tx) => {
        const originalDate = new Date(tx.date);
        let shouldInclude = false;

        // Check if this recurrent transaction should appear in the current projection month
        if (tx.recurrence_interval === 'MONTHLY') {
          // For monthly recurrence, include in every month
          shouldInclude = true;
        } else if (tx.recurrence_interval === 'YEARLY') {
          // For yearly recurrence, include only if it's the same month as the original transaction
          shouldInclude = originalDate.getMonth() === currentMonth;
        }

        if (shouldInclude) {
          const recurrentTx: Transaction = {
            ...tx,
            id: crypto.randomUUID(),
            date: new Date(currentYear, currentMonth, originalDate.getDate())
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
            installmentDate.getMonth() === currentMonth &&
            installmentDate.getFullYear() === currentYear &&
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
    projectedBalance += monthlyNet;

    projections.push({
      month: monthName,
      year: currentYear,
      projected_balance: projectedBalance,
      transactions: monthTransactions,
    });

    // Move to next month
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return projections;
}
