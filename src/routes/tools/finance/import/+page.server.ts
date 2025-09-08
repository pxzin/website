import { turso, createTables } from '$lib/server/turso';
import { fail } from '@sveltejs/kit';
import crypto from 'crypto';
import type { Actions } from '@sveltejs/kit';

export const load = async () => {
  try {
    await createTables();

    // Load accounts
    const accountsResult = await turso.execute(
      'SELECT * FROM accounts ORDER BY name'
    );
    const accounts = accountsResult.rows.map((row) => ({
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
    const categories = categoriesResult.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      type: row.type as string,
      icon: row.icon as string,
    }));

    return {
      accounts,
      categories,
    };
  } catch (error) {
    console.error('Error loading import data:', error);
    return {
      accounts: [],
      categories: [],
    };
  }
};

export const actions: Actions = {
  createCategory: async ({ request }) => {
    try {
      const formData = await request.formData();
      const name = formData.get('name') as string;
      const icon = formData.get('icon') as string;

      if (!name) {
        return fail(400, { message: 'Name is required' });
      }

      const categoryId = crypto.randomUUID();

      await turso.execute({
        sql: 'INSERT INTO categories (id, name, type, icon) VALUES (?, ?, ?, ?)',
        args: [categoryId, name, 'EXPENSE', icon || '📁'], // Default to EXPENSE for compatibility
      });

      return {
        success: true,
        category: {
          id: categoryId,
          name,
          type: 'EXPENSE',
          icon: icon || '📁',
        },
      };
    } catch (error) {
      console.error('Error creating category:', error);
      return fail(500, { message: 'Failed to create category' });
    }
  },

  import: async ({ request }) => {
    try {
      const formData = await request.formData();
      const accountId = formData.get('account_id') as string;
      const importType = formData.get('import_type') as string;
      const transactionsJson = formData.get('transactions') as string;

      if (!accountId) {
        return fail(400, { message: 'Account ID is required' });
      }

      if (!transactionsJson) {
        return fail(400, { message: 'Transactions data is required' });
      }

      const transactions = JSON.parse(transactionsJson);

      if (!Array.isArray(transactions) || transactions.length === 0) {
        return fail(400, { message: 'No transactions to import' });
      }

      // Validate account exists
      const accountResult = await turso.execute({
        sql: 'SELECT id FROM accounts WHERE id = ?',
        args: [accountId],
      });

      if (accountResult.rows.length === 0) {
        return fail(400, { message: 'Invalid account ID' });
      }

      // Import transactions
      let importedCount = 0;

      for (const transaction of transactions) {
        try {
          const transactionId = crypto.randomUUID();

          // Handle amount based on import type and transaction type
          // Normalize transaction amounts based on type:
          // - INCOME: always positive
          // - EXPENSE: always negative
          let finalAmount: number;

          if (transaction.type === 'income') {
            finalAmount = Math.abs(transaction.amount); // Always positive for income
          } else if (transaction.type === 'expense') {
            finalAmount = -Math.abs(transaction.amount); // Always negative for expense
          } else {
            throw new Error(`Invalid transaction type: ${transaction.type}`);
          }

          await turso.execute({
            sql: `INSERT INTO transactions 
                  (id, description, amount, date, account_id, category_id, type, 
                   is_recurrent, installments_total, installments_paid, installment_start_date)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              transactionId,
              transaction.title,
              finalAmount,
              transaction.date,
              accountId,
              transaction.category_id,
              transaction.type,
              transaction.is_recurrent ? 1 : 0,
              transaction.installments_total,
              transaction.installments_paid,
              transaction.installment_start_date,
            ],
          });

          // Update account balance
          await turso.execute({
            sql: 'UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?',
            args: [finalAmount, accountId],
          });

          importedCount++;
        } catch (error) {
          console.error(
            `Error importing transaction: ${transaction.title}`,
            error
          );
          // Continue with next transaction
        }
      }

      if (importedCount === 0) {
        return fail(500, { message: 'Failed to import any transactions' });
      }

      return {
        success: true,
        message: `Successfully imported ${importedCount} transaction(s)`,
        imported_count: importedCount,
      };
    } catch (error) {
      console.error('Error importing transactions:', error);
      return fail(500, { message: 'Internal server error during import' });
    }
  },
};
