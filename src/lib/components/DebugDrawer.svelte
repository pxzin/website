<script lang="ts">
  import { dev } from '$app/environment';
  import { slide } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import {
    showError,
    showSuccess,
    showWarning,
    showInfo,
  } from '$lib/stores/toast';

  let isOpen = false;

  function toggleDrawer() {
    isOpen = !isOpen;
  }

  function closeDrawer() {
    isOpen = false;
  }

  // Only show in development
  $: showDebug = dev;

  // Test data creation functions
  async function createTestAccounts() {
    try {
      showInfo('Creating test accounts...');

      const testAccounts = [
        { name: 'Test Checking', type: 'CHECKING', initialBalance: 5000 },
        {
          name: 'Test Credit Card',
          type: 'CREDIT_CARD',
          initialBalance: -1200,
          creditLimit: 5000,
          dueDay: 15,
        },
        { name: 'Test Cash', type: 'CASH', initialBalance: 300 },
      ];

      let successCount = 0;
      for (const account of testAccounts) {
        const formData = new FormData();
        formData.append('name', account.name);
        formData.append('type', account.type);
        formData.append('initialBalance', account.initialBalance.toString());
        if (account.creditLimit)
          formData.append('creditLimit', account.creditLimit.toString());
        if (account.dueDay)
          formData.append('dueDay', account.dueDay.toString());

        const response = await fetch('/tools/finance?/addAccount', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) successCount++;
      }

      showSuccess(
        `${successCount}/${testAccounts.length} test accounts created!`
      );
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      showError('Failed to create test accounts');
      console.error(error);
    }
  }

  async function createTestCategories() {
    try {
      showInfo('Creating test categories...');

      const testCategories = [
        { name: 'Test Salary', type: 'INCOME' },
        { name: 'Test Freelance', type: 'INCOME' },
        { name: 'Test Groceries', type: 'EXPENSE' },
        { name: 'Test Transport', type: 'EXPENSE' },
        { name: 'Test Entertainment', type: 'EXPENSE' },
        { name: 'Test Utilities', type: 'EXPENSE' },
      ];

      let successCount = 0;
      for (const category of testCategories) {
        const formData = new FormData();
        formData.append('name', category.name);
        formData.append('type', category.type);

        const response = await fetch('/tools/finance?/addCategory', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) successCount++;
      }

      showSuccess(
        `${successCount}/${testCategories.length} test categories created!`
      );
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      showError('Failed to create test categories');
      console.error(error);
    }
  }

  async function createTestTransactions() {
    try {
      showInfo('Creating test transactions...');

      // First, get available accounts and categories
      const currentData = await fetch(window.location.href).then((r) =>
        r.text()
      );

      // Simple way to extract account and category data from the current page
      const response = await fetch('/tools/finance');
      const html = await response.text();

      // Get fresh data by calling the load function indirectly
      const dataResponse = await fetch('/tools/finance', {
        headers: { Accept: 'application/json' },
      });

      // Alternative approach: Get data from current page props
      // We'll create transactions with hardcoded names that should match our test data

      const testTransactions = [
        // Income transactions
        {
          description: 'Test Salary',
          amount: 5000,
          date: new Date().toISOString().split('T')[0], // Today
          accountName: 'Test Checking',
          categoryName: 'Test Salary',
          isRecurrent: true,
          recurrenceInterval: 'MONTHLY',
        },
        {
          description: 'Test Freelance Work',
          amount: 1500,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 5 days ago
          accountName: 'Test Checking',
          categoryName: 'Test Freelance',
          isRecurrent: false,
        },

        // Expense transactions
        {
          description: 'Test Groceries',
          amount: -300,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 2 days ago
          accountName: 'Test Checking',
          categoryName: 'Test Groceries',
          isRecurrent: false,
        },
        {
          description: 'Test Monthly Internet',
          amount: -80,
          date: new Date().toISOString().split('T')[0],
          accountName: 'Test Checking',
          categoryName: 'Test Utilities',
          isRecurrent: true,
          recurrenceInterval: 'MONTHLY',
        },
        {
          description: 'Test Credit Card Purchase',
          amount: -450,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // Yesterday
          accountName: 'Test Credit Card',
          categoryName: 'Test Entertainment',
          isRecurrent: false,
        },
        {
          description: 'Test Laptop Purchase (12x)',
          amount: -2400,
          date: new Date().toISOString().split('T')[0],
          accountName: 'Test Credit Card',
          categoryName: 'Test Entertainment',
          installmentsTotal: 12,
          installmentsPaid: 0,
          installmentStartDate: new Date().toISOString().split('T')[0],
        },
        {
          description: 'Test Cash Withdrawal',
          amount: -200,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 3 days ago
          accountName: 'Test Checking',
          categoryName: 'Test Transport',
          isRecurrent: false,
        },
      ];

      let successCount = 0;
      let skippedCount = 0;

      for (const transaction of testTransactions) {
        try {
          const formData = new FormData();
          formData.append('description', transaction.description);
          formData.append('amount', transaction.amount.toString());
          formData.append('date', transaction.date);
          formData.append('accountName', transaction.accountName);
          formData.append('categoryName', transaction.categoryName);

          if (transaction.isRecurrent) {
            formData.append('isRecurrent', 'true');
            formData.append(
              'recurrenceInterval',
              transaction.recurrenceInterval
            );
          }

          if (transaction.installmentsTotal) {
            formData.append(
              'installmentsTotal',
              transaction.installmentsTotal.toString()
            );
            formData.append(
              'installmentsPaid',
              transaction.installmentsPaid.toString()
            );
            formData.append(
              'installmentStartDate',
              transaction.installmentStartDate
            );
          }

          const response = await fetch('/tools/finance?/addTransactionByName', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            successCount++;
          } else {
            console.warn(
              `Failed to create transaction: ${transaction.description}`
            );
            skippedCount++;
          }
        } catch (error) {
          console.error(
            `Error creating transaction ${transaction.description}:`,
            error
          );
          skippedCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(
          `${successCount} test transactions created! ${skippedCount > 0 ? `(${skippedCount} skipped)` : ''}`
        );
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showWarning(
          'No transactions were created. Make sure you have created test accounts and categories first!'
        );
      }
    } catch (error) {
      showError('Failed to create test transactions');
      console.error(error);
    }
  }

  async function clearDatabase() {
    try {
      const confirmed = confirm(
        '⚠️ DANGER: This will delete ALL financial data (accounts, categories, transactions). This action cannot be undone. Are you absolutely sure?'
      );
      if (!confirmed) return;

      const doubleConfirm = prompt(
        '⚠️ FINAL WARNING: Type "DELETE ALL" to confirm complete data deletion:'
      );
      if (doubleConfirm !== 'DELETE ALL') {
        showInfo('Operation cancelled - confirmation text did not match');
        return;
      }

      showWarning('Clearing all data...');

      const formData = new FormData();
      const response = await fetch('/tools/finance?/clearAllData', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showSuccess('All data cleared successfully!');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const result = await response.json();
        showError(result?.error || 'Failed to clear database');
      }
    } catch (error) {
      showError('Failed to clear database');
      console.error(error);
    }
  }

  async function clearTransactions() {
    try {
      const confirmed = confirm(
        '⚠️ This will delete ALL transactions and reset account balances. Are you sure?'
      );
      if (!confirmed) return;

      showInfo('Clearing all transactions...');

      const formData = new FormData();
      const response = await fetch('/tools/finance?/clearTransactions', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showSuccess('All transactions cleared and balances reset!');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const result = await response.json();
        showError(result?.error || 'Failed to clear transactions');
      }
    } catch (error) {
      showError('Failed to clear transactions');
      console.error(error);
    }
  }

  async function createCompleteTestData() {
    try {
      showInfo('Creating complete test dataset...');

      let step = 1;
      const totalSteps = 3;

      // Step 1: Create test accounts
      showInfo(`Step ${step}/${totalSteps}: Creating test accounts...`);
      const testAccounts = [
        { name: 'Test Checking', type: 'CHECKING', initialBalance: 5000 },
        {
          name: 'Test Credit Card',
          type: 'CREDIT_CARD',
          initialBalance: -1200,
          creditLimit: 5000,
          dueDay: 15,
        },
        { name: 'Test Cash', type: 'CASH', initialBalance: 300 },
      ];

      for (const account of testAccounts) {
        const formData = new FormData();
        formData.append('name', account.name);
        formData.append('type', account.type);
        formData.append('initialBalance', account.initialBalance.toString());
        if (account.creditLimit)
          formData.append('creditLimit', account.creditLimit.toString());
        if (account.dueDay)
          formData.append('dueDay', account.dueDay.toString());

        await fetch('/tools/finance?/addAccount', {
          method: 'POST',
          body: formData,
        });
      }

      step++;

      // Step 2: Create test categories
      showInfo(`Step ${step}/${totalSteps}: Creating test categories...`);
      const testCategories = [
        { name: 'Test Salary', type: 'INCOME' },
        { name: 'Test Freelance', type: 'INCOME' },
        { name: 'Test Groceries', type: 'EXPENSE' },
        { name: 'Test Transport', type: 'EXPENSE' },
        { name: 'Test Entertainment', type: 'EXPENSE' },
        { name: 'Test Utilities', type: 'EXPENSE' },
      ];

      for (const category of testCategories) {
        const formData = new FormData();
        formData.append('name', category.name);
        formData.append('type', category.type);

        await fetch('/tools/finance?/addCategory', {
          method: 'POST',
          body: formData,
        });
      }

      step++;

      // Step 3: Create test transactions
      showInfo(`Step ${step}/${totalSteps}: Creating test transactions...`);
      const testTransactions = [
        // Income transactions
        {
          description: 'Test Salary',
          amount: 5000,
          date: new Date().toISOString().split('T')[0],
          accountName: 'Test Checking',
          categoryName: 'Test Salary',
          isRecurrent: true,
          recurrenceInterval: 'MONTHLY',
        },
        {
          description: 'Test Freelance Work',
          amount: 1500,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          accountName: 'Test Checking',
          categoryName: 'Test Freelance',
          isRecurrent: false,
        },

        // Expense transactions
        {
          description: 'Test Groceries',
          amount: -300,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          accountName: 'Test Checking',
          categoryName: 'Test Groceries',
          isRecurrent: false,
        },
        {
          description: 'Test Monthly Internet',
          amount: -80,
          date: new Date().toISOString().split('T')[0],
          accountName: 'Test Checking',
          categoryName: 'Test Utilities',
          isRecurrent: true,
          recurrenceInterval: 'MONTHLY',
        },
        {
          description: 'Test Credit Card Purchase',
          amount: -450,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          accountName: 'Test Credit Card',
          categoryName: 'Test Entertainment',
          isRecurrent: false,
        },
        {
          description: 'Test Laptop Purchase (12x)',
          amount: -2400,
          date: new Date().toISOString().split('T')[0],
          accountName: 'Test Credit Card',
          categoryName: 'Test Entertainment',
          installmentsTotal: 12,
          installmentsPaid: 0,
          installmentStartDate: new Date().toISOString().split('T')[0],
        },
      ];

      for (const transaction of testTransactions) {
        const formData = new FormData();
        formData.append('description', transaction.description);
        formData.append('amount', transaction.amount.toString());
        formData.append('date', transaction.date);
        formData.append('accountName', transaction.accountName);
        formData.append('categoryName', transaction.categoryName);

        if (transaction.isRecurrent) {
          formData.append('isRecurrent', 'true');
          formData.append('recurrenceInterval', transaction.recurrenceInterval);
        }

        if (transaction.installmentsTotal) {
          formData.append(
            'installmentsTotal',
            transaction.installmentsTotal.toString()
          );
          formData.append(
            'installmentsPaid',
            transaction.installmentsPaid.toString()
          );
          formData.append(
            'installmentStartDate',
            transaction.installmentStartDate
          );
        }

        await fetch('/tools/finance?/addTransactionByName', {
          method: 'POST',
          body: formData,
        });
      }

      showSuccess(
        '🎉 Complete test dataset created successfully! Refreshing page...'
      );
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      showError('Failed to create complete test dataset');
      console.error(error);
    }
  }
</script>

{#if showDebug}
  <!-- Debug Button -->
  <button
    on:click={toggleDrawer}
    class="fixed bottom-4 left-4 z-40 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
    title="Debug Menu (Dev Only)"
    aria-label="Open debug menu"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
      ></path>
    </svg>
  </button>

  <!-- Drawer -->
  {#if isOpen}
    <div
      class="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto border-r border-gray-200"
      style="box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);"
      transition:slide={{ duration: 300, axis: 'x' }}
    >
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <svg
              class="w-6 h-6 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              ></path>
            </svg>
            <h2 class="text-xl font-bold text-gray-800">Debug Menu</h2>
            <span
              class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
              >DEV</span
            >
          </div>
          <button
            on:click={closeDrawer}
            class="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close debug menu"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Debug Categories -->
        <div class="space-y-6">
          <!-- Toast Testing Section -->
          <div class="border-b border-gray-200 pb-6">
            <h3
              class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"
            >
              <span>🍞</span>
              Toast Notifications
            </h3>
            <div class="grid grid-cols-1 gap-2">
              <button
                on:click={() =>
                  showSuccess(
                    'Success! The toast system is working perfectly.'
                  )}
                class="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors"
              >
                Test Success Toast
              </button>
              <button
                on:click={() =>
                  showError('Error! This is a test error message.')}
                class="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Test Error Toast
              </button>
              <button
                on:click={() =>
                  showWarning(
                    'Warning! This is a test warning message.',
                    'Warning Title'
                  )}
                class="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600 transition-colors"
              >
                Test Warning Toast
              </button>
              <button
                on:click={() =>
                  showInfo(
                    'Information: Toast system is fully integrated!',
                    'Info'
                  )}
                class="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Test Info Toast
              </button>
              <button
                on:click={() => {
                  showSuccess('Multiple toasts test 1');
                  setTimeout(() => showError('Multiple toasts test 2'), 200);
                  setTimeout(() => showInfo('Multiple toasts test 3'), 400);
                }}
                class="bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600 transition-colors"
              >
                Test Multiple Toasts
              </button>
            </div>
          </div>

          <!-- Test Data Section -->
          <div class="border-b border-gray-200 pb-6">
            <h3
              class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"
            >
              <span>🧪</span>
              Test Data
            </h3>
            <div class="grid grid-cols-1 gap-2">
              <button
                on:click={createCompleteTestData}
                class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                🚀 Create Complete Test Dataset
              </button>
              <div class="border-t border-gray-300 my-2"></div>
              <button
                on:click={createTestAccounts}
                class="bg-indigo-500 text-white px-4 py-2 rounded text-sm hover:bg-indigo-600 transition-colors"
              >
                Create Test Accounts
              </button>
              <button
                on:click={createTestCategories}
                class="bg-cyan-500 text-white px-4 py-2 rounded text-sm hover:bg-cyan-600 transition-colors"
              >
                Create Test Categories
              </button>
              <button
                on:click={createTestTransactions}
                class="bg-teal-500 text-white px-4 py-2 rounded text-sm hover:bg-teal-600 transition-colors"
              >
                Create Test Transactions
              </button>
              <div class="border-t border-gray-300 my-2"></div>
              <button
                on:click={clearTransactions}
                class="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600 transition-colors"
              >
                🗑️ Clear Transactions Only
              </button>
              <button
                on:click={clearDatabase}
                class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors border-2 border-red-300"
              >
                ⚠️ Clear ALL Data
              </button>
            </div>
            <div class="mt-2 text-xs text-gray-500">
              <p>⚠️ Clear operations only work in development mode</p>
              <p>💡 Create accounts and categories first, then transactions</p>
              <p>
                🗑️ Clear Transactions keeps accounts/categories, resets balances
              </p>
              <p>⚠️ Clear ALL Data removes everything permanently</p>
            </div>
          </div>

          <!-- Environment Info Section -->
          <div class="border-b border-gray-200 pb-6">
            <h3
              class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"
            >
              <span>🌍</span>
              Environment Info
            </h3>
            <div class="bg-gray-50 p-3 rounded text-sm space-y-2">
              <div><strong>Mode:</strong> Development</div>
              <div><strong>Node ENV:</strong> {import.meta.env.MODE}</div>
              <div><strong>Base URL:</strong> {import.meta.env.BASE_URL}</div>
              <div>
                <strong>SSR:</strong>
                {import.meta.env.SSR ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          <!-- Future Debug Tools -->
          <div>
            <h3
              class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"
            >
              <span>🔧</span>
              Future Tools
            </h3>
            <div class="text-sm text-gray-500">
              <p>• Database queries inspector</p>
              <p>• Component state viewer</p>
              <p>• Performance metrics</p>
              <p>• Error logging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}
