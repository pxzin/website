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
      let amount = parseFloat(data.get('amount') as string);
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

      // Get category to check if it's EXPENSE type
      const categoryResult = await turso.execute({
        sql: 'SELECT type FROM categories WHERE id = ?',
        args: [categoryId],
      });

      if (categoryResult.rows.length === 0) {
        return fail(400, { error: 'Category not found' });
      }

      const categoryType = categoryResult.rows[0].type as string;

      // If category is EXPENSE, make amount negative (unless it's already negative)
      if (categoryType === 'EXPENSE' && amount > 0) {
        amount = -amount;
      }

      const id = crypto.randomUUID();

      // Add transaction (store the total amount for reference)
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

      // For installment transactions, only impact the account balance with the installment amount
      let balanceImpact = amount;
      if (installmentsTotal && installmentsTotal > 1) {
        balanceImpact = amount / installmentsTotal;
      }

      // Update account balance
      await turso.execute({
        sql: 'UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?',
        args: [balanceImpact, accountId],
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
        sql: 'SELECT amount, account_id, installments_total FROM transactions WHERE id = ?',
        args: [transactionId],
      });

      if (transactionResult.rows.length === 0) {
        return fail(404, { error: 'Transaction not found' });
      }

      const transaction = transactionResult.rows[0];
      const amount = transaction.amount as number;
      const accountId = transaction.account_id as string;
      const installmentsTotal = transaction.installments_total as number | null;

      // Calculate the actual balance impact (for installments, it's the installment amount)
      let balanceImpact = amount;
      if (installmentsTotal && installmentsTotal > 1) {
        balanceImpact = amount / installmentsTotal;
      }

      // Delete transaction
      await turso.execute({
        sql: 'DELETE FROM transactions WHERE id = ?',
        args: [transactionId],
      });

      // Reverse the account balance change (using the actual impact, not the total amount)
      await turso.execute({
        sql: 'UPDATE accounts SET current_balance = current_balance - ? WHERE id = ?',
        args: [balanceImpact, accountId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return fail(500, { error: 'Failed to delete transaction' });
    }
  },

  clearAllData: async ({ request }) => {
    try {
      // Only allow in development
      if (import.meta.env.PROD) {
        return fail(403, {
          error: 'Clear operation not allowed in production',
        });
      }

      // Delete in correct order due to foreign key constraints
      // 1. Delete all transactions first
      await turso.execute({
        sql: 'DELETE FROM transactions',
        args: [],
      });

      // 2. Delete all categories
      await turso.execute({
        sql: 'DELETE FROM categories',
        args: [],
      });

      // 3. Delete all accounts
      await turso.execute({
        sql: 'DELETE FROM accounts',
        args: [],
      });

      return { success: true, message: 'All data cleared successfully' };
    } catch (error) {
      console.error('Error clearing all data:', error);
      return fail(500, { error: 'Failed to clear all data' });
    }
  },

  clearTransactions: async ({ request }) => {
    try {
      // Only allow in development
      if (import.meta.env.PROD) {
        return fail(403, {
          error: 'Clear operation not allowed in production',
        });
      }

      // Delete all transactions and reset account balances to initial balance
      const accountsResult = await turso.execute({
        sql: 'SELECT id, initial_balance FROM accounts',
        args: [],
      });

      // Delete all transactions
      await turso.execute({
        sql: 'DELETE FROM transactions',
        args: [],
      });

      // Reset all account balances to initial balance
      for (const account of accountsResult.rows) {
        await turso.execute({
          sql: 'UPDATE accounts SET current_balance = ? WHERE id = ?',
          args: [account.initial_balance, account.id],
        });
      }

      return {
        success: true,
        message: 'All transactions cleared and account balances reset',
      };
    } catch (error) {
      console.error('Error clearing transactions:', error);
      return fail(500, { error: 'Failed to clear transactions' });
    }
  },

  addTransactionByName: async ({ request }) => {
    try {
      const data = await request.formData();
      const description = data.get('description') as string;
      let amount = parseFloat(data.get('amount') as string);
      const date = data.get('date') as string;
      const accountName = data.get('accountName') as string;
      const categoryName = data.get('categoryName') as string;
      const isRecurrent = data.get('isRecurrent') === 'true';
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

      if (
        !description ||
        isNaN(amount) ||
        !date ||
        !accountName ||
        !categoryName
      ) {
        return fail(400, { error: 'Invalid transaction data' });
      }

      // Find account by name
      const accountResult = await turso.execute({
        sql: 'SELECT id FROM accounts WHERE name = ?',
        args: [accountName],
      });

      if (accountResult.rows.length === 0) {
        return fail(400, { error: `Account "${accountName}" not found` });
      }

      const accountId = accountResult.rows[0].id as string;

      // Find category by name
      const categoryResult = await turso.execute({
        sql: 'SELECT id, type FROM categories WHERE name = ?',
        args: [categoryName],
      });

      if (categoryResult.rows.length === 0) {
        return fail(400, { error: `Category "${categoryName}" not found` });
      }

      const categoryId = categoryResult.rows[0].id as string;
      const categoryType = categoryResult.rows[0].type as string;

      // If category is EXPENSE, make amount negative (unless it's already negative)
      if (categoryType === 'EXPENSE' && amount > 0) {
        amount = -amount;
      }

      const id = crypto.randomUUID();

      // Add transaction (store the total amount for reference)
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

      // For installment transactions, only impact the account balance with the installment amount
      let balanceImpact = amount;
      if (installmentsTotal && installmentsTotal > 1) {
        balanceImpact = amount / installmentsTotal;
      }

      // Update account balance
      await turso.execute({
        sql: 'UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?',
        args: [balanceImpact, accountId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding transaction by name:', error);
      return fail(500, { error: 'Failed to add transaction' });
    }
  },

  importBackup: async ({ request }) => {
    try {
      const data = await request.formData();
      const backupFile = data.get('backupFile') as File;

      if (!backupFile) {
        return fail(400, { error: 'No backup file provided' });
      }

      // Read and parse the backup file
      const backupText = await backupFile.text();
      let backup;

      try {
        backup = JSON.parse(backupText);
      } catch (parseError) {
        return fail(400, { error: 'Invalid JSON format in backup file' });
      }

      // Validate backup structure
      if (
        !backup.data ||
        !backup.data.accounts ||
        !backup.data.categories ||
        !backup.data.transactions
      ) {
        return fail(400, { error: 'Invalid backup file structure' });
      }

      // Validate required fields in data
      if (
        !Array.isArray(backup.data.accounts) ||
        !Array.isArray(backup.data.categories) ||
        !Array.isArray(backup.data.transactions)
      ) {
        return fail(400, {
          error:
            'Backup data must contain arrays for accounts, categories, and transactions',
        });
      }

      // Validate backup version compatibility
      if (!backup.version || backup.version !== '1.0') {
        return fail(400, {
          error:
            'Unsupported backup version. This tool only supports version 1.0 backups.',
        });
      }

      // Clear all existing data first
      await turso.execute('DELETE FROM transactions');
      await turso.execute('DELETE FROM categories');
      await turso.execute('DELETE FROM accounts');

      // Import accounts
      for (const account of backup.data.accounts) {
        await turso.execute({
          sql: 'INSERT INTO accounts (id, name, type, initial_balance, current_balance, credit_limit, due_day) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [
            account.id,
            account.name,
            account.type,
            account.initial_balance,
            account.current_balance,
            account.credit_limit,
            account.due_day,
          ],
        });
      }

      // Import categories
      for (const category of backup.data.categories) {
        await turso.execute({
          sql: 'INSERT INTO categories (id, name, type) VALUES (?, ?, ?)',
          args: [category.id, category.name, category.type],
        });
      }

      // Import transactions
      for (const transaction of backup.data.transactions) {
        await turso.execute({
          sql: `INSERT INTO transactions (id, description, amount, date, account_id, category_id, is_recurrent, recurrence_interval, installments_total, installments_paid, installment_start_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            transaction.id,
            transaction.description,
            transaction.amount,
            transaction.date,
            transaction.account_id,
            transaction.category_id,
            transaction.is_recurrent,
            transaction.recurrence_interval,
            transaction.installments_total,
            transaction.installments_paid,
            transaction.installment_start_date,
          ],
        });
      }

      return {
        success: true,
        message: `Backup imported successfully! Restored ${backup.data.accounts.length} accounts, ${backup.data.categories.length} categories, and ${backup.data.transactions.length} transactions.`,
        imported: {
          accounts: backup.data.accounts.length,
          categories: backup.data.categories.length,
          transactions: backup.data.transactions.length,
        },
      };
    } catch (error) {
      console.error('Error importing backup:', error);
      return fail(500, { error: 'Failed to import backup' });
    }
  },

  refreshProjections: async () => {
    try {
      // Just return success - the projections will be recalculated on page reload via invalidateAll()
      return {
        success: true,
        message: 'Projections refreshed successfully!',
      };
    } catch (error) {
      console.error('Error refreshing projections:', error);
      return fail(500, { error: 'Failed to refresh projections' });
    }
  },

  debugData: async () => {
    try {
      // Check current data in database
      const accountsResult = await turso.execute(
        'SELECT COUNT(*) as count FROM accounts'
      );
      const transactionsResult = await turso.execute(
        'SELECT COUNT(*) as count FROM transactions'
      );
      const categoriesResult = await turso.execute(
        'SELECT COUNT(*) as count FROM categories'
      );

      const accountsCount = accountsResult.rows[0]?.count || 0;
      const transactionsCount = transactionsResult.rows[0]?.count || 0;
      const categoriesCount = categoriesResult.rows[0]?.count || 0;

      return {
        success: true,
        message: `Debug: ${accountsCount} accounts, ${transactionsCount} transactions, ${categoriesCount} categories`,
        counts: {
          accounts: accountsCount,
          transactions: transactionsCount,
          categories: categoriesCount,
        },
      };
    } catch (error) {
      console.error('Error debugging data:', error);
      return fail(500, { error: 'Failed to debug data' });
    }
  },
};
