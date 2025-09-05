import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Check current transactions table structure
const checkTransactionsStructure = async () => {
  try {
    const result = await turso.execute({
      sql: "PRAGMA table_info(transactions);",
      args: [],
    });
    
    console.log('Transactions table structure:');
    console.log(result.rows);
    
    // Check if type column already exists
    const hasTypeColumn = result.rows.some(row => row.name === 'type');
    console.log(`Type column exists: ${hasTypeColumn}`);
    
    return hasTypeColumn;
  } catch (error) {
    console.error('Error checking table structure:', error);
    return false;
  }
};

// Check categories table structure
const checkCategoriesStructure = async () => {
  try {
    const result = await turso.execute({
      sql: "PRAGMA table_info(categories);",
      args: [],
    });
    
    console.log('Categories table structure:');
    console.log(result.rows);
    
    return result.rows;
  } catch (error) {
    console.error('Error checking categories structure:', error);
    return [];
  }
};

// Check existing data
const checkExistingData = async () => {
  try {
    const transactions = await turso.execute({
      sql: "SELECT COUNT(*) as count FROM transactions;",
      args: [],
    });
    
    const categories = await turso.execute({
      sql: "SELECT COUNT(*) as count FROM categories;",
      args: [],
    });
    
    console.log(`Existing transactions: ${transactions.rows[0].count}`);
    console.log(`Existing categories: ${categories.rows[0].count}`);
    
    if (categories.rows[0].count > 0) {
      const categoryTypes = await turso.execute({
        sql: "SELECT type, COUNT(*) as count FROM categories GROUP BY type;",
        args: [],
      });
      console.log('Category types distribution:');
      console.log(categoryTypes.rows);
    }
    
  } catch (error) {
    console.error('Error checking existing data:', error);
  }
};

// Main check function
const main = async () => {
  console.log('=== Database Structure Check ===');
  
  const hasTypeColumn = await checkTransactionsStructure();
  console.log('\n');
  
  await checkCategoriesStructure();
  console.log('\n');
  
  await checkExistingData();
  
  process.exit(0);
};

main();
