/**
 * Finance Helper Functions
 * Extracted from +page.svelte for better organization and reusability
 */

export interface InstallmentStatus {
  total: number;
  paid: number;
  remaining: number;
  percentage: number;
  isComplete: boolean;
}

export interface InstallmentValues {
  installmentValue: number;
  totalPaid: number;
  totalRemaining: number;
  paidInstallments: number;
  remainingInstallments: number;
  totalInstallments: number;
  isComplete: boolean;
}

/**
 * Get category name with icon from category ID
 */
export function getCategoryName(categoryId: string, categories: any[]): string {
  const category = categories.find((cat) => cat.id === categoryId);
  return category ? `${category.icon || '📁'} ${category.name}` : 'Unknown';
}

/**
 * Get account name from account ID
 */
export function getAccountName(accountId: string, accounts: any[]): string {
  const account = accounts.find((acc) => acc.id === accountId);
  return account ? account.name : 'Unknown';
}

/**
 * Get installment status information
 */
export function getInstallmentStatus(
  transaction: any
): InstallmentStatus | null {
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

/**
 * Get detailed installment values for financial calculations
 */
export function getInstallmentValues(
  transaction: any
): InstallmentValues | null {
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

/**
 * Get the actual balance impact (installment amount for installments)
 */
export function getBalanceImpact(transaction: any): number {
  if (transaction.installments_total && transaction.installments_total > 1) {
    return transaction.amount / transaction.installments_total;
  }
  return transaction.amount;
}

/**
 * Format recurrence interval for display
 */
export function formatRecurrenceInterval(interval: string | null): string {
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

/**
 * Filter transactions by current month
 */
export function getCurrentMonthTransactions(transactions: any[]): any[] {
  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const now = new Date();
    return (
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear()
    );
  });
}

/**
 * Filter recurrent transactions
 */
export function getRecurrentTransactions(transactions: any[]): any[] {
  return transactions.filter((tx) => tx.is_recurrent);
}

/**
 * Filter installment transactions
 */
export function getInstallmentTransactions(transactions: any[]): any[] {
  return transactions.filter((tx) => tx.installments_total);
}

/**
 * Filter regular transactions (non-recurrent, non-installment)
 */
export function getRegularTransactions(transactions: any[]): any[] {
  return transactions.filter(
    (tx) => !tx.is_recurrent && !tx.installments_total
  );
}

/**
 * Calculate total balance from accounts
 */
export function calculateTotalBalance(accounts: any[]): number {
  return accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
}
