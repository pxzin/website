
import { createClient, type Client } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export const turso: Client = createClient({
	url: TURSO_DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
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
        type TEXT NOT NULL CHECK(type IN ('CHECKING', 'CREDIT_CARD', 'CASH')),
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
		try {
			await turso.batch([
				{ sql: createTableQuery, args: [] },
				{ sql: createAccountsTableQuery, args: [] },
				{ sql: createCategoriesTableQuery, args: [] },
				{ sql: createTransactionsTableQuery, args: [] },
			]);
	} catch (error) {
		console.error('Error creating table on startup:', error);
	}
};
