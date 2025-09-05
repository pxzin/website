# Plano de Refatoração - Finance +page.svelte

## Situação Atual

- **Arquivo**: `/src/routes/tools/finance/+page.svelte`
- **Linhas**: 1052 linhas
- **Problema**: Arquivo muito grande, difícil manutenção, múltiplas responsabilidades

## Análise dos Componentes Identificados

### 1. **BackupSection.svelte**

**Linhas**: ~430-490
**Responsabilidade**: Gerenciamento de backup e importação de dados
**Props necessárias**:

- `exportBackup: function`
- `importBackup: function`
  **Conteúdo**:
- Seção "Backup & Data Management"
- Botões de Export/Import
- Dicas de backup

### 2. **GettingStartedGuide.svelte**

**Linhas**: ~400-430  
**Responsabilidade**: Guia inicial para novos usuários
**Props necessárias**:

- `accounts: array`
- `categories: array`
- `openAccountModal: function`
- `openCategoryModal: function`
  **Conteúdo**:
- Card de boas-vindas
- Passos 1, 2, 3 para começar
- Mostrado apenas quando não há contas/categorias

### 3. **ActiveRecurrencesSection.svelte**

**Linhas**: ~490-560
**Responsabilidade**: Lista de transações recorrentes ativas
**Props necessárias**:

- `recurrentTransactions: array`
- `getCategoryName: function`
- `getAccountName: function`
- `formatRecurrenceInterval: function`
  **Conteúdo**:
- Seção "Active Recurrences"
- Cards com transações recorrentes
- Tags de tipo (income/expense)

### 4. **ActiveInstallmentsSection.svelte**

**Linhas**: ~560-670
**Responsabilidade**: Lista de parcelamentos ativos
**Props necessárias**:

- `installmentTransactions: array`
- `getInstallmentStatus: function`
- `getCategoryName: function`
- `getAccountName: function`
  **Conteúdo**:
- Seção "Active Installments"
- Progress bars de parcelamentos
- Detalhes de InstallmentDetails

### 5. **TransactionsList.svelte**

**Linhas**: ~670-870
**Responsabilidade**: Lista principal de transações com abas
**Props necessárias**:

- `transactions: array`
- `currentMonthTransactions: array`
- `getCategoryName: function`
- `getAccountName: function`
- `getBalanceImpact: function`
- `getInstallmentStatus: function`
- `formatRecurrenceInterval: function`
- `deleteTransactionEnhance: function`
  **Conteúdo**:
- Abas "Current Month" / "All Transactions"
- Lista de transações com detalhes
- Botões de deletar
- Tags de tipo, recorrência, parcelamento

### 6. **FloatingActionButton.svelte**

**Linhas**: ~970-1040
**Responsabilidade**: FAB menu para ações rápidas
**Props necessárias**:

- `showFABMenu: boolean`
- `toggleFABMenu: function`
- `openFormDrawerFromFAB: function`
  **Conteúdo**:
- Backdrop quando menu aberto
- Botões: Add Transaction, Category, Account
- Animações de entrada
- FAB principal

### 7. **FinancePageHeader.svelte**

**Linhas**: ~370-400
**Responsabilidade**: Cabeçalho da página
**Props necessárias**:

- Nenhuma (logout via form)
  **Conteúdo**:
- Título "Financial Overview"
- Botão de logout

## Utilitários que Devem Ser Extraídos

### 8. **financeHelpers.ts**

**Localização**: Script section
**Responsabilidade**: Funções utilitárias
**Funções**:

- `getCategoryName(categoryId, categories)`
- `getAccountName(accountId, accounts)`
- `getInstallmentStatus(transaction)`
- `getInstallmentValues(transaction)`
- `getBalanceImpact(transaction)`
- `formatRecurrenceInterval(interval)`

### 9. **financeActions.ts**

**Localização**: Script section  
**Responsabilidade**: Ações de negócio
**Funções**:

- `refreshProjections()`
- `debugData()`
- `exportBackup()`
- `importBackup()`
- `deleteTransactionEnhance()`

## Estado que Permanece no +page.svelte

### Estados Principais:

- `accounts, categories, transactions, projections` (do data)
- `totalBalance` (computed)
- `recurrentTransactions, installmentTransactions` (computed)
- `currentMonthTransactions` (computed)

### Estados de UI:

- `activeTransactionsTab`
- `showFormDrawer, activeForm`
- `showFABMenu`
- `showAccountForm, showCategoryForm, showTransactionForm`

## Ordem de Refatoração Proposta

### **Fase 1: Utilitários** ✅ (Baixo risco)

1. ✅ Criar `financeHelpers.ts`
2. ✅ Criar `financeActions.ts`
3. ✅ Atualizar imports no +page.svelte

### **Fase 2: Componentes Simples** ✅ (Baixo risco)

4. ✅ Criar `FinancePageHeader.svelte`
5. ✅ Criar `GettingStartedGuide.svelte`
6. ✅ Criar `BackupSection.svelte`

### **Fase 3: Componentes Complexos** (Médio risco)

7. Criar `ActiveRecurrencesSection.svelte`
8. Criar `ActiveInstallmentsSection.svelte`
9. Criar `FloatingActionButton.svelte`

### **Fase 4: Componente Principal** (Alto risco)

10. Criar `TransactionsList.svelte`

### **Fase 5: Limpeza Final**

11. Revisar e limpar +page.svelte
12. Testar todas as funcionalidades

## Benefícios Esperados

- ✅ **Legibilidade**: Cada componente com responsabilidade única
- ✅ **Manutenibilidade**: Mudanças isoladas por funcionalidade
- ✅ **Reutilização**: Componentes podem ser reutilizados
- ✅ **Testabilidade**: Componentes menores são mais fáceis de testar
- ✅ **Performance**: Possível otimização de re-renders
- ✅ **Colaboração**: Equipe pode trabalhar em componentes diferentes

## Estrutura Final Esperada

```
src/lib/components/finance/
├── page/
│   ├── FinancePageHeader.svelte
│   ├── GettingStartedGuide.svelte
│   ├── BackupSection.svelte
│   ├── ActiveRecurrencesSection.svelte
│   ├── ActiveInstallmentsSection.svelte
│   ├── TransactionsList.svelte
│   └── FloatingActionButton.svelte
├── helpers/
│   ├── financeHelpers.ts
│   └── financeActions.ts
└── (componentes existentes...)
```

## Riscos e Mitigações

### **Riscos**:

- Quebrar funcionalidades existentes
- Props drilling excessivo
- Perda de reatividade entre componentes

### **Mitigações**:

- Refatoração incremental por fases
- Testes após cada fase
- Manter stores para estado compartilhado se necessário
- Usar event dispatchers para comunicação entre componentes
