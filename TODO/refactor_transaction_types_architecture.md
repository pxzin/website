# Task: Refactor Transaction Types Architecture

## Description

Refactor the finance tool architecture to move transaction types (income/expense) from being stored in categories to being stored directly in transactions. This will simplify the data model, improve query performance, and make the system more intuitive by allowing categories to be purely organizational without carrying type semantics.

## Current Architecture Issues

- Transaction types are currently stored in the `categories` table as `type` field
- This creates confusion between organizational categories and transaction types
- Queries require JOINs to determine transaction type
- Categories become overloaded with both organizational and type information
- Filtering by transaction type requires category-level filtering

## Proposed Solution

### Database Schema Changes

1. **Add `type` field to `transactions` table**
   - Add `type TEXT NOT NULL CHECK (type IN ('income', 'expense'))` column
   - Default existing transactions based on their category type

2. **Remove `type` field from `categories` table**
   - Categories become purely organizational
   - Remove type-based constraints and logic

3. **Update foreign key relationships**
   - Maintain category relationships for organization
   - Simplify queries by removing category type dependencies

### Code Changes

1. **Database Layer (`src/lib/server/turso.ts`)**
   - Add migration logic for schema changes
   - Update all transaction CRUD operations
   - Simplify category operations
   - Update projection calculations

2. **Business Logic (`src/lib/utils/financeProjections.ts`)**
   - Update projection calculations to use transaction.type
   - Remove category-based type logic
   - Simplify balance calculations

3. **UI Components**
   - Update `TransactionForm.svelte` to include type selection
   - Modify `CategoryForm.svelte` to remove type field
   - Update transaction displays and filters
   - Modify projection components

4. **Server Actions (`src/routes/tools/finance/+page.server.ts`)**
   - Update all form actions
   - Simplify category queries
   - Update transaction queries and filters

## Steps

### Phase 1: Database Schema Migration

1. **Create migration script**
   - Add `type` column to `transactions` table
   - Populate `type` based on existing category types
   - Verify data integrity

2. **Update schema definitions**
   - Modify table creation in `turso.ts`
   - Update type definitions
   - Add validation constraints

### Phase 2: Backend Logic Updates

1. **Update transaction operations**
   - Modify `saveTransaction` to handle type field
   - Update `getTransactions` to use transaction type
   - Simplify category operations by removing type logic

2. **Update projection calculations**
   - Modify `financeProjections.ts` to use transaction.type
   - Remove category-based type filtering
   - Test calculation accuracy

### Phase 3: Frontend Component Updates

1. **Update transaction forms**
   - Add transaction type selector to `TransactionForm.svelte`
   - Remove type field from `CategoryForm.svelte`
   - Update form validation

2. **Update display components**
   - Modify transaction lists to show type directly
   - Update filtering logic in main page
   - Simplify category displays

### Phase 4: Server Actions Refactoring

1. **Update form actions**
   - Modify transaction actions to handle type field
   - Simplify category actions
   - Update validation logic

2. **Update data loading**
   - Simplify transaction queries
   - Remove category type joins where possible
   - Update page load functions

### Phase 5: Testing & Validation

1. **Data migration testing**
   - Verify all existing transactions have correct types
   - Test projection calculations accuracy
   - Validate form submissions

2. **UI/UX testing**
   - Test all transaction operations
   - Verify category management still works
   - Test projection displays

### Phase 6: Documentation & Cleanup

1. **Update documentation**
   - Update README.md with new architecture
   - Document migration process
   - Update API documentation

2. **Code cleanup**
   - Remove unused type-related code from categories
   - Clean up comments and variable names
   - Update tests

## Implementation Details

### Migration Strategy

```sql
-- Add type column to transactions
ALTER TABLE transactions ADD COLUMN type TEXT CHECK (type IN ('income', 'expense'));

-- Populate type based on category type
UPDATE transactions 
SET type = (
    SELECT categories.type 
    FROM categories 
    WHERE categories.id = transactions.category_id
);

-- Make type column required
-- (This requires recreating table in SQLite)

-- Remove type column from categories (future step)
```

### Key Changes Summary

- **Transactions**: Add `type` field, update all CRUD operations
- **Categories**: Remove `type` field, simplify to pure organization
- **Projections**: Use `transaction.type` instead of `category.type`
- **Forms**: Add type selector to transaction form, remove from category form
- **Queries**: Simplify by removing category type joins

## Benefits

- **Simplified Data Model**: Clear separation of concerns
- **Better Performance**: Fewer JOINs required for type-based queries
- **Improved UX**: Direct transaction type selection
- **Cleaner Code**: Remove category type complexity
- **More Intuitive**: Categories are purely organizational

## Verification

- All existing transactions maintain correct types after migration
- New transactions can be created with type selection
- Categories work purely for organization without type constraints
- Projections calculate correctly using transaction types
- All forms and displays work with new architecture
- No data loss during migration process

## Rollback Plan

- Keep backup of original database schema
- Maintain migration scripts for reverting changes
- Test rollback procedure before implementing
- Document rollback steps for emergency use
