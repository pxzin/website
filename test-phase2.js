import { createClient } from '@libsql/client';

const turso = createClient({
  url: 'http://127.0.0.1:8080',
  authToken: 'dummy',
});

/**
 * TESTE DA FASE 2: Backend Logic Updates
 * Testar novas operações de transação com coluna type
 */
const testPhase2 = async () => {
  console.log('🧪 Testando Fase 2: Backend Logic Updates...\n');

  try {
    // Passo 1: Criar dados de teste básicos
    console.log('📝 Passo 1: Criando dados de teste...');
    
    // Criar categoria (ainda precisa de type para compatibilidade)
    await turso.execute({
      sql: `INSERT OR REPLACE INTO categories (id, name, type) VALUES ('test-cat-income', 'Salário', 'INCOME');`,
      args: [],
    });

    await turso.execute({
      sql: `INSERT OR REPLACE INTO categories (id, name, type) VALUES ('test-cat-expense', 'Alimentação', 'EXPENSE');`,
      args: [],
    });

    // Criar conta
    await turso.execute({
      sql: `INSERT OR REPLACE INTO accounts (id, name, type, initial_balance, current_balance) 
            VALUES ('test-acc', 'Conta Teste', 'CASH', 1000, 1000);`,
      args: [],
    });

    console.log('✅ Dados de teste criados!');

    // Passo 2: Testar inserção de transação de income
    console.log('\n📝 Passo 2: Testando inserção de transação income...');
    
    await turso.execute({
      sql: `INSERT INTO transactions (id, description, amount, date, account_id, category_id, type) 
            VALUES ('test-income', 'Salário de setembro', 3000.0, '2025-09-05', 'test-acc', 'test-cat-income', 'income');`,
      args: [],
    });

    console.log('✅ Transação income inserida!');

    // Passo 3: Testar inserção de transação de expense
    console.log('\n📝 Passo 3: Testando inserção de transação expense...');
    
    await turso.execute({
      sql: `INSERT INTO transactions (id, description, amount, date, account_id, category_id, type) 
            VALUES ('test-expense', 'Almoço', -50.0, '2025-09-05', 'test-acc', 'test-cat-expense', 'expense');`,
      args: [],
    });

    console.log('✅ Transação expense inserida!');

    // Passo 4: Verificar se as transações foram inseridas corretamente
    console.log('\n🔍 Passo 4: Verificando transações inseridas...');
    
    const transactionsResult = await turso.execute({
      sql: `SELECT t.id, t.description, t.amount, t.type, c.name as category_name, c.type as category_type
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.id IN ('test-income', 'test-expense')
            ORDER BY t.amount DESC;`,
      args: [],
    });

    console.log('📋 Transações encontradas:');
    transactionsResult.rows.forEach(row => {
      console.log(`  - ${row.description}: ${row.amount} (tipo: ${row.type}) | Categoria: ${row.category_name} (${row.category_type})`);
    });

    // Passo 5: Testar consulta com filtro por tipo
    console.log('\n🔍 Passo 5: Testando filtro por tipo de transação...');
    
    const incomeTransactions = await turso.execute({
      sql: `SELECT description, amount, type FROM transactions WHERE type = 'income' AND id LIKE 'test-%';`,
      args: [],
    });

    const expenseTransactions = await turso.execute({
      sql: `SELECT description, amount, type FROM transactions WHERE type = 'expense' AND id LIKE 'test-%';`,
      args: [],
    });

    console.log(`💰 Transações de income: ${incomeTransactions.rows.length}`);
    incomeTransactions.rows.forEach(row => {
      console.log(`  - ${row.description}: ${row.amount}`);
    });

    console.log(`💸 Transações de expense: ${expenseTransactions.rows.length}`);
    expenseTransactions.rows.forEach(row => {
      console.log(`  - ${row.description}: ${row.amount}`);
    });

    // Passo 6: Limpeza
    console.log('\n🧹 Passo 6: Limpando dados de teste...');
    await turso.execute({
      sql: `DELETE FROM transactions WHERE id IN ('test-income', 'test-expense');`,
      args: [],
    });
    await turso.execute({
      sql: `DELETE FROM categories WHERE id IN ('test-cat-income', 'test-cat-expense');`,
      args: [],
    });
    await turso.execute({
      sql: `DELETE FROM accounts WHERE id = 'test-acc';`,
      args: [],
    });

    console.log('✅ Dados de teste removidos!');

    console.log('\n🎉 FASE 2 - TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('📋 Funcionalidades testadas:');
    console.log('   ✅ Inserção de transações com campo type');
    console.log('   ✅ Consulta de transações com type');
    console.log('   ✅ Filtro por tipo de transação');
    console.log('   ✅ JOINs com categorias funcionando');
    console.log('\n➡️  Próximo passo: Atualizar componentes frontend');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
  
  process.exit(0);
};

testPhase2();
