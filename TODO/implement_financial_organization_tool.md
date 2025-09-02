# Task: Implement Financial Organization Tool

## Description
Implement a comprehensive financial organization tool within the `/tools` section. This tool will allow users to track income and expenses, manage different financial accounts (checking, credit cards, cash), handle recurring and installment-based transactions, and provide financial projections for future months.

## Proposed Solution

Leverage the existing Turso database for data persistence. The tool will consist of:

1.  **Database Schema:** Define tables for `accounts`, `categories`, and `transactions` to store financial data.
2.  **Backend Logic (`+page.server.ts`):** Implement CRUD operations for all entities. Develop logic for calculating projections based on recurring and installment transactions.
3.  **Frontend UI (`+page.svelte`):** Create an intuitive interface for:
    *   Viewing current account balances.
    *   Adding/editing/deleting accounts, categories, and transactions.
    *   Displaying a list of transactions.
    *   Visualizing financial projections.

## Steps

1.  **Database Schema & Initial Setup (Completed in Phase 1)**
    *   Create `feat/finance-tool` branch.
    *   Update `src/lib/server/turso.ts` with new table definitions (`accounts`, `categories`, `transactions`).
    *   Create `src/routes/tools/finance` directory.
    *   Create `src/routes/tools/finance/+page.server.ts` with basic load and action placeholders.
    *   Create `src/routes/tools/finance/+page.svelte` with basic UI structure.
    *   Update `TODO/index.md` and create `TODO/implement_financial_organization_tool.md`.

2.  **Core Backend Logic (Phase 2)**
    *   Implement full CRUD for `accounts`, `categories`, and `transactions` in `+page.server.ts`.
    *   Add logic to handle `current_balance` updates on transaction add/edit/delete.
    *   Develop projection calculation logic.

3.  **Frontend Enhancements (Phase 3)**
    *   Improve UI for displaying accounts, categories, and transactions.
    *   Implement filtering and sorting for transactions.
    *   Design and implement the projection visualization.
    *   Add forms for editing/deleting existing entries.

4.  **Integration & Refinement (Phase 4)**
    *   Ensure proper data flow between frontend and backend.
    *   Add validation and error handling.
    *   Test all functionalities thoroughly.
    *   Update `CHANGELOG.md`.
    *   Commit and merge to `main`.

## Verification

*   All financial data (accounts, categories, transactions) can be added, viewed, edited, and deleted.
*   Account balances are updated correctly with transactions.
*   Recurring and installment transactions are handled in projections.
*   Financial projections accurately reflect future cash flow.
*   The tool is accessible via `/tools/finance` and protected by authentication.
