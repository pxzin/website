import { turso } from '$lib/server/turso';
import { fail } from '@sveltejs/kit';
import crypto from 'crypto';

export async function load() {
  try {
    const accountsResult = await turso.execute('SELECT id, name, type, initial_balance, current_balance, credit_limit, due_day FROM accounts');
    const categoriesResult = await turso.execute('SELECT id, name, type FROM categories');
    const transactionsResult = await turso.execute('SELECT id, description, amount, date, account_id, category_id, is_recurrent, recurrence_interval, installments_total, installments_paid, installment_start_date FROM transactions');

    const accounts = accountsResult.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      type: row.type as string,
      initial_balance: row.initial_balance as number,
      current_balance: row.current_balance as number,
      credit_limit: row.credit_limit as number | null,
      due_day: row.due_day as number | null,
    }));

    const categories = categoriesResult.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      type: row.type as string,
    }));

    const transactions = transactionsResult.rows.map(row => ({
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

    return { accounts, categories, transactions };
  } catch (error) {
    console.error('Failed to load finance data:', error);
    return { accounts: [], categories: [], transactions: [] };
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

  // Placeholder for delete actions
  deleteAccount: async ({ request }) => { return fail(501, { message: 'Not yet implemented.' }); },
  deleteCategory: async ({ request }) => { return fail(501, { message: 'Not yet implemented.' }); },
  deleteTransaction: async ({ request }) => { return fail(501, { message: 'Not yet implemented.' }); },

  // Placeholder for update actions
  updateAccount: async ({ request }) => { return fail(501, { message: 'Not yet implemented.' }); },
  updateCategory: async ({ request }) => { return fail(501, { message: 'Not yet implemented.' }); },
  updateTransaction: async ({ request }) => { return fail(501, { message: 'Not yet implemented.' }); },
};
