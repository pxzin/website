import { turso } from '$lib/server/turso';
import { fail } from '@sveltejs/kit';
import crypto from 'crypto';

interface Account {
  id: string;
  name: string;
  type: string;
  initial_balance: number;
  current_balance: number;
  credit_limit: number | null;
  due_day: number | null;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Transaction {
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
}

interface ProjectionMonth {
  month: string;
  year: number;
  projected_balance: number;
  transactions: Transaction[];
}

function calculateProjections(accounts: Account[], transactions: Transaction[], monthsToProject: number = 6): ProjectionMonth[] {
  const projections: ProjectionMonth[] = [];
  let currentBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);

  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  for (let i = 0; i < monthsToProject; i++) {
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
    const monthTransactions: Transaction[] = [];

    // Add existing transactions for the current month
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        monthTransactions.push(tx);
      }
    });

    // Add recurrent transactions
    transactions.filter(tx => tx.is_recurrent).forEach(tx => {
      // For simplicity, assume monthly recurrence for now
      const recurrentTx: Transaction = { ...tx, id: crypto.randomUUID(), date: new Date(currentYear, currentMonth, new Date(tx.date).getDate()).toISOString().split('T')[0] };
      monthTransactions.push(recurrentTx);
    });

    // Add installment transactions
    transactions.filter(tx => tx.installments_total && tx.installments_paid !== null).forEach(tx => {
      const startDate = new Date(tx.installment_start_date || tx.date);
      const totalInstallments = tx.installments_total || 0;
      const paidInstallments = tx.installments_paid || 0;
      const remainingInstallments = totalInstallments - paidInstallments;

      for (let j = 0; j < remainingInstallments; j++) {
        const installmentMonth = (startDate.getMonth() + paidInstallments + j) % 12;
        const installmentYear = startDate.getFullYear() + Math.floor((startDate.getMonth() + paidInstallments + j) / 12);

        if (installmentMonth === currentMonth && installmentYear === currentYear) {
          const installmentTx: Transaction = { ...tx, id: crypto.randomUUID(), amount: tx.amount / totalInstallments, date: new Date(currentYear, currentMonth, startDate.getDate()).toISOString().split('T')[0] };
          monthTransactions.push(installmentTx);
        }
      }
    });

    // Calculate projected balance for the month
    const monthlyNet = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    currentBalance += monthlyNet;

    projections.push({
      month: monthName,
      year: currentYear,
      projected_balance: currentBalance,
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

export async function load() {
  try {
    const accountsResult = await turso.execute('SELECT id, name, type, initial_balance, current_balance, credit_limit, due_day FROM accounts');
    const categoriesResult = await turso.execute('SELECT id, name, type FROM categories');
    const transactionsResult = await turso.execute('SELECT id, description, amount, date, account_id, category_id, is_recurrent, recurrence_interval, installments_total, installments_paid, installment_start_date FROM transactions');

    const accounts: Account[] = accountsResult.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      type: row.type as string,
      initial_balance: row.initial_balance as number,
      current_balance: row.current_balance as number,
      credit_limit: row.credit_limit as number | null,
      due_day: row.due_day as number | null,
    }));

    const categories: Category[] = categoriesResult.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      type: row.type as string,
    }));

    const transactions: Transaction[] = transactionsResult.rows.map(row => ({
      id: row.id as string,
      description: row.description as string,
      amount: row.amount as number,
      date: row.date as string,
      account_id: row.account_id as string,
      category_id: row.category_id as string,
      is_recurrent: !!row.is_recurrent,
      recurrence_interval: row.recurrence_interval as string | null,
      installments_total: row.installments_total as number | null,
      installments_paid: row.installments_paid as number | null,
      installment_start_date: row.installment_start_date as string | null,
    }));

    const projections = calculateProjections(accounts, transactions);

    return { accounts, categories, transactions, projections };
  } catch (error) {
    console.error('Failed to load finance data:', error);
    return { accounts: [], categories: [], transactions: [], projections: [] };
  }
}

export const actions = {
  addAccount: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name');
    const type = data.get('type');
    const initial_balance = parseFloat(data.get('initial_balance') as string);
    const credit_limit = data.get('credit_limit') ? parseFloat(data.get('credit_limit') as string) : null;
    const due_day = data.get('due_day') ? parseInt(data.get('due_day') as string) : null;

    if (!name || !type || isNaN(initial_balance)) {
      return fail(400, { message: 'Missing required fields for account.' });
    }

    const id = crypto.randomUUID();
    try {
      await turso.execute({
        sql: 'INSERT INTO accounts (id, name, type, initial_balance, current_balance, credit_limit, due_day) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [id, name.toString(), type.toString(), initial_balance, initial_balance, credit_limit, due_day],
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to add account:', error);
      return fail(500, { message: 'Failed to add account.' });
    }
  },

  addCategory: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name');
    const type = data.get('type');

    if (!name || !type) {
      return fail(400, { message: 'Missing required fields for category.' });
    }

    const id = crypto.randomUUID();
    try {
      await turso.execute({
        sql: 'INSERT INTO categories (id, name, type) VALUES (?, ?, ?)',
        args: [id, name.toString(), type.toString()],
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to add category:', error);
      return fail(500, { message: 'Failed to add category.' });
    }
  },

  addTransaction: async ({ request }) => {
    const data = await request.formData();
    const description = data.get('description');
    const amount = parseFloat(data.get('amount') as string);
    const date = data.get('date');
    const account_id = data.get('account_id');
    const category_id = data.get('category_id');
    const is_recurrent = data.get('is_recurrent') === 'true' ? 1 : 0;
    const recurrence_interval = data.get('recurrence_interval') || null;
    const installments_total = data.get('installments_total') ? parseInt(data.get('installments_total') as string) : null;
    const installments_paid = data.get('installments_paid') ? parseInt(data.get('installments_paid') as string) : null;
    const installment_start_date = data.get('installment_start_date') || null;

    if (!description || isNaN(amount) || !date || !account_id || !category_id) {
      return fail(400, { message: 'Missing required fields for transaction.' });
    }

    const id = crypto.randomUUID();
    try {
      await turso.execute({
        sql: 'INSERT INTO transactions (id, description, amount, date, account_id, category_id, is_recurrent, recurrence_interval, installments_total, installments_paid, installment_start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          id,
          description.toString(),
          amount,
          date.toString(),
          account_id.toString(),
          category_id.toString(),
          is_recurrent,
          recurrence_interval,
          installments_total,
          installments_paid,
          installment_start_date,
        ],
      });

      // Update account balance
      await turso.execute({
        sql: 'UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?',
        args: [amount, account_id.toString()],
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to add transaction:', error);
      return fail(500, { message: 'Failed to add transaction.' });
    }
  },

  deleteAccount: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');

    if (!id) {
      return fail(400, { message: 'Missing account ID.' });
    }

    try {
      // Get all transactions for this account to revert balances
      const transactionsResult = await turso.execute({ sql: 'SELECT amount, account_id FROM transactions WHERE account_id = ?', args: [id.toString()] });
      for (const transaction of transactionsResult.rows) {
        await turso.execute({ sql: 'UPDATE accounts SET current_balance = current_balance - ? WHERE id = ?', args: [transaction.amount as number, transaction.account_id as string] });
      }

      // Delete all transactions associated with the account
      await turso.execute({ sql: 'DELETE FROM transactions WHERE account_id = ?', args: [id.toString()] });
      // Delete the account
      await turso.execute({ sql: 'DELETE FROM accounts WHERE id = ?', args: [id.toString()] });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete account:', error);
      return fail(500, { message: 'Failed to delete account.' });
    }
  },

  deleteCategory: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');

    if (!id) {
      return fail(400, { message: 'Missing category ID.' });
    }

    try {
      await turso.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id.toString()] });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete category:', error);
      return fail(500, { message: 'Failed to delete category.' });
    }
  },

  deleteTransaction: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    const account_id = data.get('account_id');
    const amount = parseFloat(data.get('amount') as string);

    if (!id || !account_id || isNaN(amount)) {
      return fail(400, { message: 'Missing transaction ID, account ID, or amount.' });
    }

    try {
      await turso.execute({ sql: 'DELETE FROM transactions WHERE id = ?', args: [id.toString()] });
      // Revert account balance
      await turso.execute({ sql: 'UPDATE accounts SET current_balance = current_balance - ? WHERE id = ?', args: [amount, account_id.toString()] });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      return fail(500, { message: 'Failed to delete transaction.' });
    }
  },

  updateAccount: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    const name = data.get('name');
    const type = data.get('type');
    const initial_balance = parseFloat(data.get('initial_balance') as string);
    const current_balance = parseFloat(data.get('current_balance') as string);
    const credit_limit = data.get('credit_limit') ? parseFloat(data.get('credit_limit') as string) : null;
    const due_day = data.get('due_day') ? parseInt(data.get('due_day') as string) : null;

    if (!id || !name || !type || isNaN(initial_balance) || isNaN(current_balance)) {
      return fail(400, { message: 'Missing required fields for account update.' });
    }

    try {
      await turso.execute({
        sql: 'UPDATE accounts SET name = ?, type = ?, initial_balance = ?, current_balance = ?, credit_limit = ?, due_day = ? WHERE id = ?',
        args: [name.toString(), type.toString(), initial_balance, current_balance, credit_limit, due_day, id.toString()],
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to update account:', error);
      return fail(500, { message: 'Failed to update account.' });
    }
  },

  updateCategory: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    const name = data.get('name');
    const type = data.get('type');

    if (!id || !name || !type) {
      return fail(400, { message: 'Missing required fields for category update.' });
    }

    try {
      await turso.execute({
        sql: 'UPDATE categories SET name = ?, type = ? WHERE id = ?',
        args: [name.toString(), type.toString(), id.toString()],
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to update category:', error);
      return fail(500, { message: 'Failed to update category.' });
    }
  },

  updateTransaction: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    const description = data.get('description');
    const amount = parseFloat(data.get('amount') as string);
    const date = data.get('date');
    const account_id = data.get('account_id');
    const category_id = data.get('category_id');
    const is_recurrent = data.get('is_recurrent') === 'true' ? 1 : 0;
    const recurrence_interval = data.get('recurrence_interval') || null;
    const installments_total = data.get('installments_total') ? parseInt(data.get('installments_total') as string) : null;
    const installments_paid = data.get('installments_paid') ? parseInt(data.get('installments_paid') as string) : null;
    const installment_start_date = data.get('installment_start_date') || null;

    if (!id || !description || isNaN(amount) || !date || !account_id || !category_id) {
      return fail(400, { message: 'Missing required fields for transaction update.' });
    }

    try {
      // Get old amount to adjust balance
      const oldTransactionResult = await turso.execute({ sql: 'SELECT amount FROM transactions WHERE id = ?', args: [id.toString()] });
      const oldAmount = oldTransactionResult.rows[0].amount as number;

      await turso.execute({
        sql: 'UPDATE transactions SET description = ?, amount = ?, date = ?, account_id = ?, category_id = ?, is_recurrent = ?, recurrence_interval = ?, installments_total = ?, installments_paid = ?, installment_start_date = ? WHERE id = ?',
        args: [
          description.toString(),
          amount,
          date.toString(),
          account_id.toString(),
          category_id.toString(),
          is_recurrent,
          recurrence_interval,
          installments_total,
          installments_paid,
          installment_start_date,
          id.toString(),
        ],
      });

      // Adjust account balance: subtract old amount, add new amount
      await turso.execute({
        sql: 'UPDATE accounts SET current_balance = current_balance - ? + ? WHERE id = ?',
        args: [oldAmount, amount, account_id.toString()],
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to update transaction:', error);
      return fail(500, { message: 'Failed to update transaction.' });
    }
  },
};
