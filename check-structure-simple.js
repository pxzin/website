import { createClient } from '@libsql/client';

const turso = createClient({
  url: 'http://127.0.0.1:8080',
  authToken: 'dummy',
});

// Verificar estrutura das tabelas antes da migração
const main = async () => {
  try {
    console.log('🔍 Verificando estrutura atual do banco...\n');

    // Estrutura da tabela transactions
    const transactionsStructure = await turso.execute({
      sql: "PRAGMA table_info(transactions);",
      args: [],
    });

    console.log('📋 Estrutura da tabela transactions:');
    transactionsStructure.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
    });

    // Verificar se coluna type já existe
    const hasTypeColumn = transactionsStructure.rows.some(row => row.name === 'type');
    console.log(`\n❓ Coluna 'type' já existe na tabela transactions: ${hasTypeColumn ? '✅ SIM' : '❌ NÃO'}`);

    // Estrutura da tabela categories
    const categoriesStructure = await turso.execute({
      sql: "PRAGMA table_info(categories);",
      args: [],
    });

    console.log('\n📋 Estrutura da tabela categories:');
    categoriesStructure.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
    });

    // Verificar dados existentes
    const transactionsCount = await turso.execute({
      sql: "SELECT COUNT(*) as count FROM transactions;",
      args: [],
    });

    const categoriesCount = await turso.execute({
      sql: "SELECT COUNT(*) as count FROM categories;",
      args: [],
    });

    console.log(`\n📊 Dados existentes:`);
    console.log(`  - Transações: ${transactionsCount.rows[0]?.count || 0}`);
    console.log(`  - Categorias: ${categoriesCount.rows[0]?.count || 0}`);

    const categoriesCountNum = Number(categoriesCount.rows[0]?.count || 0);
    if (categoriesCountNum > 0) {
      const categoryTypes = await turso.execute({
        sql: "SELECT type, COUNT(*) as count FROM categories GROUP BY type;",
        args: [],
      });

      console.log('\n📈 Distribuição de tipos de categoria:');
      categoryTypes.rows.forEach(row => {
        console.log(`  - ${row.type}: ${row.count} categorias`);
      });
    }

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  }
  
  process.exit(0);
};

main();
