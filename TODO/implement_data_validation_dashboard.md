# Dashboard de Validação de Dados

## 🎯 Objetivo

Criar um sistema abrangente de validação de dados que identifique inconsistências, duplicatas e problemas de integridade no sistema financeiro antes que causem impactos nas análises e projeções.

## 🔍 Problemas Identificados

### Inconsistências de Dados

- Transações com valores zerados ou negativos inesperados
- Datas futuras em transações históricas
- Categorias inexistentes ou mal formadas
- Descrições vazias ou com caracteres especiais problemáticos

### Duplicatas e Redundâncias

- Transações duplicadas (mesmo valor, data e descrição)
- Recorrências conflitantes (múltiplas regras para mesmo período)
- Categorias com nomes similares mas diferentes

### Problemas de Integridade Referencial

- Transações referenciando categorias inexistentes
- Recorrências sem transações correspondentes
- Ajustes órfãos sem recorrência pai

## 🏗️ Arquitetura da Solução

### 1. Backend - Sistema de Validação

```typescript
// src/lib/server/validation/
├── validators/
│   ├── transactionValidators.ts
│   ├── recurrenceValidators.ts
│   ├── categoryValidators.ts
│   └── integrityValidators.ts
├── validationEngine.ts
├── validationRules.ts
└── validationReports.ts
```

### 2. Frontend - Dashboard de Validação

```typescript
// src/routes/tools/finance/validation/
├── +page.server.ts
├── +page.svelte
└── components/
    ├── ValidationSummary.svelte
    ├── ValidationDetails.svelte
    ├── IssuesList.svelte
    └── AutoFixSuggestions.svelte
```

## 🔧 Funcionalidades Detalhadas

### 1. Validação Automática

- **Trigger**: Após cada operação CRUD no banco
- **Scope**: Validação incremental (apenas dados afetados)
- **Performance**: Validação assíncrona para não bloquear UI

### 2. Validação Manual/Completa

- **Trigger**: Botão "Validar Todos os Dados"
- **Scope**: Verificação completa de todo o banco
- **Relatório**: Exportável em JSON/CSV

### 3. Categorização de Problemas

```typescript
enum ValidationSeverity {
  CRITICAL = 'critical', // Bloqueia operações
  WARNING = 'warning', // Requer atenção
  INFO = 'info', // Informativo
}

enum ValidationCategory {
  DATA_INTEGRITY = 'data_integrity',
  BUSINESS_RULES = 'business_rules',
  DUPLICATES = 'duplicates',
  FORMATTING = 'formatting',
}
```

### 4. Sistema de Auto-correção

- **Duplicatas**: Sugestão de merge ou remoção
- **Formatação**: Correção automática de textos
- **Categorias**: Sugestão de unificação
- **Datas**: Correção de formatos inconsistentes

## 🎨 Interface do Dashboard

### Layout Principal

```
┌─────────────────────────────────────┐
│ 🔍 Dashboard de Validação           │
├─────────────────────────────────────┤
│ [Validar Agora] [Exportar Relatório]│
├─────────────────────────────────────┤
│ 📊 Resumo Geral                     │
│ ✅ Dados OK: 1,247                  │
│ ⚠️  Avisos: 23                      │
│ ❌ Críticos: 3                      │
├─────────────────────────────────────┤
│ 🔧 Problemas Detectados             │
│ [Críticos] [Avisos] [Informativos]  │
├─────────────────────────────────────┤
│ 📋 Lista de Issues                  │
│ • Transação #1234 - Valor negativo │
│   [Detalhes] [Corrigir]            │
│ • Categoria "Food" duplicada       │
│   [Unificar] [Ignorar]             │
└─────────────────────────────────────┘
```

### Componentes Detalhados

#### ValidationSummary.svelte

- Cards com contadores por severidade
- Gráfico de rosca mostrando distribuição
- Botões de ação rápida
- Status da última validação

#### ValidationDetails.svelte

- Filtros por categoria/severidade
- Busca por texto
- Ordenação por data/severidade
- Paginação para grandes volumes

#### IssuesList.svelte

- Lista expansível de problemas
- Ações contextuais (corrigir/ignorar)
- Preview dos dados afetados
- Links diretos para edição

#### AutoFixSuggestions.svelte

- Sugestões de correção automática
- Preview das mudanças
- Aplicação em lote
- Confirmação de segurança

## 📝 Regras de Validação

### Transações

```typescript
const transactionRules = [
  {
    name: 'positive_amount',
    check: (t) => t.amount > 0,
    severity: 'warning',
    message: 'Transação com valor não-positivo',
  },
  {
    name: 'valid_date',
    check: (t) => t.date <= new Date(),
    severity: 'critical',
    message: 'Data futura em transação histórica',
  },
  {
    name: 'category_exists',
    check: (t) => categories.includes(t.category),
    severity: 'critical',
    message: 'Categoria inexistente',
  },
];
```

### Recorrências

```typescript
const recurrenceRules = [
  {
    name: 'valid_interval',
    check: (r) => r.interval_days > 0,
    severity: 'critical',
    message: 'Intervalo de recorrência inválido',
  },
  {
    name: 'future_start_date',
    check: (r) => r.start_date >= new Date(),
    severity: 'warning',
    message: 'Recorrência com data de início no passado',
  },
];
```

## 🚀 Plano de Implementação

### Fase 1: Estrutura Base (Semana 1)

- [ ] Criar estrutura de pastas
- [ ] Implementar validationEngine.ts base
- [ ] Criar esquema do banco para logs de validação
- [ ] Página básica do dashboard

### Fase 2: Validadores Core (Semana 2)

- [ ] Implementar transactionValidators.ts
- [ ] Implementar recurrenceValidators.ts
- [ ] Implementar categoryValidators.ts
- [ ] Testes unitários para validadores

### Fase 3: Interface e UX (Semana 3)

- [ ] Componente ValidationSummary
- [ ] Componente IssuesList
- [ ] Sistema de filtros e busca
- [ ] Integração com sistema de notificações

### Fase 4: Auto-correção (Semana 4)

- [ ] AutoFixSuggestions component
- [ ] Lógica de correção automática
- [ ] Sistema de backup antes das correções
- [ ] Testes de integração completos

## 🧪 Estratégia de Testes

### Testes Unitários

- Cada regra de validação individualmente
- Cenários edge case
- Performance com grandes volumes

### Testes de Integração

- Validação completa do sistema
- Interação entre validadores
- Interface do dashboard

### Testes de Performance

- Validação de 10k+ transações
- Validação incremental vs completa
- Otimização de queries

## 📊 Métricas de Sucesso

### Técnicas

- Tempo de validação < 2 segundos para 1k transações
- 0 falsos positivos em regras críticas
- < 5% falsos positivos em regras de warning

### UX

- < 3 cliques para corrigir problema comum
- 100% dos problemas críticos são acionáveis
- Dashboard carrega em < 1 segundo

### Negócio

- Redução de 90% em inconsistências de dados
- 0 análises baseadas em dados incorretos
- Tempo de debugging reduzido em 80%

---

**Prioridade**: 🔥 ALTA
**Complexidade**: ⚡ MÉDIA
**Tempo Estimado**: 4 semanas
**Dependências**: Nenhuma
