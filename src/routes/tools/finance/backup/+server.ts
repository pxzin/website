import { turso } from '$lib/server/turso';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { action } = await request.json();

    if (action === 'export') {
      // Get all data
      const accountsResult = await turso.execute(
        'SELECT * FROM accounts ORDER BY name'
      );
      const categoriesResult = await turso.execute(
        'SELECT * FROM categories ORDER BY name'
      );
      const transactionsResult = await turso.execute(
        'SELECT * FROM transactions ORDER BY date DESC'
      );

      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          accounts: accountsResult.rows,
          categories: categoriesResult.rows,
          transactions: transactionsResult.rows,
        },
        metadata: {
          total_accounts: accountsResult.rows.length,
          total_categories: categoriesResult.rows.length,
          total_transactions: transactionsResult.rows.length,
        },
      };

      return json({
        success: true,
        backup: JSON.stringify(backup, null, 2),
        filename: `finance-backup-${
          new Date().toISOString().split('T')[0]
        }.json`,
      });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in backup endpoint:', error);
    return json({ error: 'Failed to process backup request' }, { status: 500 });
  }
};
