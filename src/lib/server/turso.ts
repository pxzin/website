
import { createClient, type Client } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export const turso: Client = createClient({
	url: TURSO_DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
});

// IIFE to create tables on module initialization
(async () => {
	const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    );
  `;
	try {
		await turso.execute(createTableQuery);
		console.log('Table "todos" is ready on server startup');
	} catch (error) {
		console.error('Error creating table on startup:', error);
	}
})();
