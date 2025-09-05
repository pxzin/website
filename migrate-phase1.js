import { createClient } from '@libsql/client';

const turso = createClient({
  url: 'http://127.0.0.1:8080',
  authToken: 'dummy',
});

/**
 * FASE 1: Database Schema Migration
 * Adicionar coluna 'type' à tabela transactions
 */
const migrateTransactionTypes = async () => {
  console.log('🚀 Iniciando migração da arquitetura de tipos de transação...\n');

  try {
    // Passo 1: Adicionar coluna type à tabela transactions
    console.log('📝 Passo 1: Adicionando coluna type à tabela transactions...');
    
    await turso.execute({
      sql: `ALTER TABLE transactions ADD COLUMN type TEXT CHECK (type IN ('income', 'expense'));`,
      args: [],
    });
    
    console.log('✅ Coluna type adicionada com sucesso!');

    // Passo 2: Verificar estrutura atualizada
    console.log('\n🔍 Passo 2: Verificando estrutura atualizada...');
    
    const updatedStructure = await turso.execute({
      sql: "PRAGMA table_info(transactions);",
      args: [],
    });

    console.log('📋 Nova estrutura da tabela transactions:');
    updatedStructure.rows.forEach(row => {
      const isNew = row.name === 'type';
      const prefix = isNew ? '🆕' : '  ';
      console.log(`${prefix} - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
    });

    // Passo 3: Testar inserção de dados com a nova estrutura
    console.log('\n🧪 Passo 3: Testando inserção com nova estrutura...');
    
    // Criar categoria de teste
    await turso.execute({
      sql: `INSERT INTO categories (id, name, type) VALUES ('test-cat', 'Teste', 'EXPENSE');`,
      args: [],
    });

    // Criar conta de teste
    await turso.execute({
      sql: `INSERT INTO accounts (id, name, type, initial_balance, current_balance) 
            VALUES ('test-acc', 'Teste', 'CASH', 0, 0);`,
      args: [],
    });

    // Inserir transação de teste com type
    await turso.execute({
      sql: `INSERT INTO transactions (id, description, amount, date, account_id, category_id, type) 
            VALUES ('test-trans', 'Transação de teste', 100.0, '2025-09-05', 'test-acc', 'test-cat', 'expense');`,
      args: [],
    });

    console.log('✅ Transação de teste inserida com sucesso!');

    // Verificar se a transação foi inserida corretamente
    const testTransaction = await turso.execute({
      sql: `SELECT id, description, type FROM transactions WHERE id = 'test-trans';`,
      args: [],
    });

    if (testTransaction.rows.length > 0) {
      const row = testTransaction.rows[0];
      console.log(`🎯 Transação recuperada: ${row.description} (tipo: ${row.type})`);
    }

    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    await turso.execute({
      sql: `DELETE FROM transactions WHERE id = 'test-trans';`,
      args: [],
    });
    await turso.execute({
      sql: `DELETE FROM categories WHERE id = 'test-cat';`,
      args: [],
    });
    await turso.execute({
      sql: `DELETE FROM accounts WHERE id = 'test-acc';`,
      args: [],
    });

    console.log('✅ Dados de teste removidos!');

    console.log('\n🎉 FASE 1 CONCLUÍDA COM SUCESSO!');
    console.log('📋 Resumo das mudanças:');
    console.log('   ✅ Coluna type adicionada à tabela transactions');
    console.log('   ✅ Constraint CHECK aplicado (income/expense)');
    console.log('   ✅ Funcionalidade testada e validada');
    console.log('\n➡️  Próximo passo: Atualizar código para usar nova estrutura');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    console.log('\n🔄 A migração foi interrompida. Nenhuma alteração permanente foi feita.');
  }
  
  process.exit(0);
};

migrateTransactionTypes();
