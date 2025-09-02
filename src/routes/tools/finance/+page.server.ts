import { turso, createTables } from '$lib/server/turso';
import { fail } from '@sveltejs/kit';
import crypto from 'crypto';
import {
  calculateProjections,
  type Account,
  type Category,
  type Transaction,
} from '$lib/utils/financeProjections';

export async function load() {
  try {
    await createTables();

    // Load accounts
    const accountsResult = await turso.execute(
      'SELECT * FROM accounts ORDER BY name'
    );
    const accounts: Account[] = accountsResult.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      type: row.type as string,
      initial_balance: row.initial_balance as number,
      current_balance: row.current_balance as number,
      credit_limit: row.credit_limit as number | null,
      due_day: row.due_day as number | null,
    }));

    // Load categories
    const categoriesResult = await turso.execute(
      'SELECT * FROM categories ORDER BY name'
    );
    const categories: Category[] = categoriesResult.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      type: row.type as string,
    }));

    // Load transactions
    const transactionsResult = await turso.execute(
      'SELECT * FROM transactions ORDER BY date DESC'
    );
    const transactions: Transaction[] = transactionsResult.rows.map((row) => ({
      id: row.id as string,
      description: row.description as string,
      amount: row.amount as number,
      date: row.date as string,
      account_id: row.account_id as string,
      category_id: row.category_id as string,
      is_recurrent: Boolean(row.is_recurrent),
      recurrence_interval: row.recurrence_interval as string | null,
      installments_total: row.installments_total as number | null,
      installments_paid: row.installments_paid as number | null,
      installment_start_date: row.installment_start_date as string | null,
    }));

    // Calculate projections
    const projections = calculateProjections(accounts, transactions);

    return {
      accounts,
      categories,
      transactions,
      projections,
    };
  } catch (error) {
    console.error('Error loading finance data:', error);
    return {
      accounts: [],
      categories: [],
      transactions: [],
      projections: [],
    };
  }
}

export const actions = {
  addAccount: async ({ request }) => {
    try {
      const data = await request.formData();
      const name = data.get('name') as string;
      const type = data.get('type') as string;
      const initialBalance = parseFloat(data.get('initialBalance') as string);
      const creditLimit = data.get('creditLimit')
        ? parseFloat(data.get('creditLimit') as string)
        : null;
      const dueDay = data.get('dueDay')
        ? parseInt(data.get('dueDay') as string)
        : null;

      if (!name || !type || isNaN(initialBalance)) {
        return fail(400, { error: 'Invalid account data' });
      }

      const id = crypto.randomUUID();
      await turso.execute({
        sql: 'INSERT INTO accounts (id, name, type, initial_balance, current_balance, credit_limit, due_day) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [
          id,
          name,
          type,
          initialBalance,
          initialBalance,
          creditLimit,
          dueDay,
        ],
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding account:', error);
      return fail(500, { error: 'Failed to add account' });
    }
  },

  addCategory: async ({ request }) => {
    try {
      const data = await request.formData();
      const name = data.get('name') as string;
      const type = data.get('type') as string;

      if (!name || !type) {
        return fail(400, { error: 'Invalid category data' });
      }

      const id = crypto.randomUUID();
      await turso.execute({
        sql: 'INSERT INTO categories (id, name, type) VALUES (?, ?, ?)',
        args: [id, name, type],
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding category:', error);
      return fail(500, { error: 'Failed to add category' });
    }
  },

  addTransaction: async ({ request }) => {
    try {
      const data = await request.formData();
      const description = data.get('description') as string;
      const amount = parseFloat(data.get('amount') as string);
      const date = data.get('date') as string;
      const accountId = data.get('accountId') as string;
      const categoryId = data.get('categoryId') as string;
      const isRecurrent = data.get('isRecurrent') === 'on';
      const recurrenceInterval =
        (data.get('recurrenceInterval') as string) || null;
      const installmentsTotal = data.get('installmentsTotal')
        ? parseInt(data.get('installmentsTotal') as string)
        : null;
      const installmentsPaid = data.get('installmentsPaid')
        ? parseInt(data.get('installmentsPaid') as string)
        : null;
      const installmentStartDate =
        (data.get('installmentStartDate') as string) || null;

      if (!description || isNaN(amount) || !date || !accountId || !categoryId) {
        return fail(400, { error: 'Invalid transaction data' });
      }

      const id = crypto.randomUUID();

      // Add transaction
      await turso.execute({
        sql: `INSERT INTO transactions (id, description, amount, date, account_id, category_id, is_recurrent, recurrence_interval, installments_total, installments_paid, installment_start_date) 
				      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          description,
          amount,
          date,
          accountId,
          categoryId,
          isRecurrent ? 1 : 0,
          recurrenceInterval,
          installmentsTotal,
          installmentsPaid,
          installmentStartDate,
        ],
      });

      // Update account balance
      await turso.execute({
        sql: 'UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?',
        args: [amount, accountId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding transaction:', error);
      return fail(500, { error: 'Failed to add transaction' });
    }
  },

  deleteAccount: async ({ request }) => {
    try {
      const data = await request.formData();
      const accountId = data.get('accountId') as string;

      if (!accountId) {
        return fail(400, { error: 'Account ID required' });
      }

      // Check if account has transactions
      const transactionsResult = await turso.execute({
        sql: 'SELECT COUNT(*) as count FROM transactions WHERE account_id = ?',
        args: [accountId],
      });

      const transactionCount = transactionsResult.rows[0].count as number;
      if (transactionCount > 0) {
        return fail(400, {
          error: 'Cannot delete account with existing transactions',
        });
      }

      await turso.execute({
        sql: 'DELETE FROM accounts WHERE id = ?',
        args: [accountId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      return fail(500, { error: 'Failed to delete account' });
    }
  },

  deleteCategory: async ({ request }) => {
    try {
      const data = await request.formData();
      const categoryId = data.get('categoryId') as string;

      if (!categoryId) {
        return fail(400, { error: 'Category ID required' });
      }

      // Check if category has transactions
      const transactionsResult = await turso.execute({
        sql: 'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
        args: [categoryId],
      });

      const transactionCount = transactionsResult.rows[0].count as number;
      if (transactionCount > 0) {
        return fail(400, {
          error: 'Cannot delete category with existing transactions',
        });
      }

      await turso.execute({
        sql: 'DELETE FROM categories WHERE id = ?',
        args: [categoryId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      return fail(500, { error: 'Failed to delete category' });
    }
  },

  deleteTransaction: async ({ request }) => {
    try {
      const data = await request.formData();
      const transactionId = data.get('transactionId') as string;

      if (!transactionId) {
        return fail(400, { error: 'Transaction ID required' });
      }

      // Get transaction details before deleting
      const transactionResult = await turso.execute({
        sql: 'SELECT amount, account_id FROM transactions WHERE id = ?',
        args: [transactionId],
      });

      if (transactionResult.rows.length === 0) {
        return fail(404, { error: 'Transaction not found' });
      }

      const transaction = transactionResult.rows[0];
      const amount = transaction.amount as number;
      const accountId = transaction.account_id as string;

      // Delete transaction
      await turso.execute({
        sql: 'DELETE FROM transactions WHERE id = ?',
        args: [transactionId],
      });

      // Reverse the account balance change
      await turso.execute({
        sql: 'UPDATE accounts SET current_balance = current_balance - ? WHERE id = ?',
        args: [amount, accountId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return fail(500, { error: 'Failed to delete transaction' });
    }
  },
};
