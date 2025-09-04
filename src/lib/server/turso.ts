import { createClient, type Client } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export const turso: Client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

export const createTables = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    );
  `;

  const createAccountsTableQuery = `
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'BUSINESS', 'CASH', 'CRYPTO', 'LOAN', 'PENSION', 'OTHER')),
        initial_balance REAL NOT NULL,
        current_balance REAL NOT NULL,
        credit_limit REAL,
        due_day INTEGER
      );
    `;

  const createCategoriesTableQuery = `
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE'))
      );
    `;

  const createTransactionsTableQuery = `
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        account_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        is_recurrent INTEGER DEFAULT 0,
        recurrence_interval TEXT CHECK(recurrence_interval IN ('MONTHLY', 'YEARLY')),
        installments_total INTEGER,
        installments_paid INTEGER,
        installment_start_date TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `;

  const createRecurrenceAdjustmentsTableQuery = `
      CREATE TABLE IF NOT EXISTS recurrence_adjustments (
        id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        year_month TEXT NOT NULL,
        original_amount REAL NOT NULL,
        adjusted_amount REAL NOT NULL,
        reason TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
        UNIQUE (transaction_id, year_month)
      );
    `;

  try {
    await turso.batch([
      { sql: createTableQuery, args: [] },
      { sql: createAccountsTableQuery, args: [] },
      { sql: createCategoriesTableQuery, args: [] },
      { sql: createTransactionsTableQuery, args: [] },
      { sql: createRecurrenceAdjustmentsTableQuery, args: [] },
    ]);

    // Skip migration for now to avoid conflicts
    // await migrateAccountTypes();
  } catch (error) {
    console.error('Error creating table on startup:', error);
  }
};

const migrateAccountTypes = async () => {
  try {
    // Check if we need to migrate by trying to insert a new account type
    const testResult = await turso.execute({
      sql: "SELECT COUNT(*) as count FROM accounts WHERE type NOT IN ('CHECKING', 'CREDIT_CARD', 'CASH')",
      args: [],
    });

    // If there are any accounts with new types, or if we can't create new types, we need to migrate
    // Since SQLite constraints are complex to modify, we'll recreate the table if needed
    const checkConstraint = await turso.execute({
      sql: "SELECT sql FROM sqlite_master WHERE type='table' AND name='accounts'",
      args: [],
    });

    if (checkConstraint.rows.length > 0) {
      const tableDefinition = checkConstraint.rows[0].sql as string;

      // Check if the constraint includes the new types
      if (
        !tableDefinition.includes('SAVINGS') ||
        !tableDefinition.includes('INVESTMENT')
      ) {
        console.log('Migrating accounts table to support new account types...');

        // Disable foreign key constraints temporarily
        await turso.execute('PRAGMA foreign_keys = OFF');

        // Backup existing data
        const existingAccounts = await turso.execute('SELECT * FROM accounts');

        // Check if transactions table exists and backup its data
        let existingTransactions: any = { rows: [] };
        try {
          existingTransactions = await turso.execute(
            'SELECT * FROM transactions'
          );
        } catch (e) {
          // Transactions table might not exist yet
        }

        // Drop tables in correct order (child first, then parent)
        await turso.execute('DROP TABLE IF EXISTS transactions');
        await turso.execute('DROP TABLE IF EXISTS accounts');

        // Recreate accounts table with new constraints
        const newAccountsTableQuery = `
					CREATE TABLE accounts (
						id TEXT PRIMARY KEY,
						name TEXT NOT NULL,
						type TEXT NOT NULL CHECK(type IN ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'BUSINESS', 'CASH', 'CRYPTO', 'LOAN', 'PENSION', 'OTHER')),
						initial_balance REAL NOT NULL,
						current_balance REAL NOT NULL,
						credit_limit REAL,
						due_day INTEGER
					);
				`;

        await turso.execute(newAccountsTableQuery);

        // Recreate transactions table if it existed
        if (existingTransactions.rows.length > 0) {
          const newTransactionsTableQuery = `
						CREATE TABLE transactions (
							id TEXT PRIMARY KEY,
							description TEXT NOT NULL,
							amount REAL NOT NULL,
							date TEXT NOT NULL,
							account_id TEXT NOT NULL,
							category_id TEXT NOT NULL,
							is_recurrent INTEGER DEFAULT 0,
							recurrence_interval TEXT CHECK(recurrence_interval IN ('MONTHLY', 'YEARLY')),
							installments_total INTEGER,
							installments_paid INTEGER,
							installment_start_date TEXT,
							FOREIGN KEY (account_id) REFERENCES accounts(id),
							FOREIGN KEY (category_id) REFERENCES categories(id)
						);
					`;
          await turso.execute(newTransactionsTableQuery);
        }

        // Restore accounts data
        for (const account of existingAccounts.rows) {
          await turso.execute({
            sql: `INSERT INTO accounts (id, name, type, initial_balance, current_balance, credit_limit, due_day) 
							  VALUES (?, ?, ?, ?, ?, ?, ?)`,
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

        // Restore transactions data if it existed
        for (const transaction of existingTransactions.rows) {
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

        // Re-enable foreign key constraints
        await turso.execute('PRAGMA foreign_keys = ON');

        console.log('Migration completed successfully!');
      }
    }
  } catch (error) {
    console.error('Error during migration:', error);
    // Re-enable foreign key constraints in case of error
    try {
      await turso.execute('PRAGMA foreign_keys = ON');
    } catch (e) {
      // Ignore error when re-enabling
    }
    // Migration failed, but app can continue with existing table
  }
};

// Functions for managing recurrence adjustments

export const saveRecurrenceAdjustment = async (
  transactionId: string,
  yearMonth: string,
  originalAmount: number,
  adjustedAmount: number,
  reason?: string
) => {
  try {
    const id = crypto.randomUUID();
    await turso.execute({
      sql: `INSERT OR REPLACE INTO recurrence_adjustments 
            (id, transaction_id, year_month, original_amount, adjusted_amount, reason)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        transactionId,
        yearMonth,
        originalAmount,
        adjustedAmount,
        reason || '',
      ],
    });
  } catch (error) {
    console.error('Error saving recurrence adjustment:', error);
    throw error;
  }
};

export const getRecurrenceAdjustments = async () => {
  try {
    const result = await turso.execute(
      'SELECT * FROM recurrence_adjustments ORDER BY year_month DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching recurrence adjustments:', error);
    return [];
  }
};

export const getRecurrenceAdjustment = async (
  transactionId: string,
  yearMonth: string
) => {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM recurrence_adjustments WHERE transaction_id = ? AND year_month = ?',
      args: [transactionId, yearMonth],
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching recurrence adjustment:', error);
    return null;
  }
};

export const deleteRecurrenceAdjustment = async (
  transactionId: string,
  yearMonth: string
) => {
  try {
    await turso.execute({
      sql: 'DELETE FROM recurrence_adjustments WHERE transaction_id = ? AND year_month = ?',
      args: [transactionId, yearMonth],
    });
  } catch (error) {
    console.error('Error removing recurrence adjustment:', error);
    throw error;
  }
};
