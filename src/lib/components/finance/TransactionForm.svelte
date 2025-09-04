<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { showError, showSuccess } from '$lib/stores/toast';

  export let accounts: any[] = [];
  export let categories: any[] = [];
  export let showForm = false;

  let newTransactionDescription = '';
  let newTransactionAmount = 0;
  let newTransactionDate = new Date().toISOString().split('T')[0];
  let newTransactionAccountId = '';
  let newTransactionCategoryId = '';
  let newTransactionIsRecurrent = false;
  let newTransactionRecurrenceInterval = 'MONTHLY';
  let newTransactionInstallmentsTotal: number | null = null;
  let newTransactionInstallmentsPaid: number | null = null;
  let newTransactionInstallmentStartDate: string | null = null;

  // New reactive properties for improved UX
  $: selectedCategory = categories.find(
    (cat) => cat.id === newTransactionCategoryId
  );
  $: isExpense = selectedCategory?.type === 'EXPENSE';
  $: isIncome = selectedCategory?.type === 'INCOME';
  $: selectedAccount = accounts.find(
    (acc) => acc.id === newTransactionAccountId
  );
  $: showInstallmentFields =
    newTransactionInstallmentsTotal && newTransactionInstallmentsTotal > 1;

  // Form validation
  $: isFormValid =
    newTransactionDescription.trim() !== '' &&
    newTransactionAmount !== 0 &&
    newTransactionAccountId !== '' &&
    newTransactionCategoryId !== '';

  // Checkbox state for installments
  let isInstallmentTransaction = false;

  // Quick entry mode for batch transaction entry
  let quickEntryMode = false;
  let keepLastValues = false;
  let transactionCount = 0;

  // Store last used values for quick entry
  let lastUsedAccount = '';
  let lastUsedCategory = '';
  let lastUsedDate = new Date().toISOString().split('T')[0];

  // Get account type icon
  function getAccountIcon(type: string) {
    const iconMap: Record<string, string> = {
      CHECKING: '🏛️',
      SAVINGS: '🏛️',
      CREDIT_CARD: '💳',
      INVESTMENT: '📈',
      BUSINESS: '🏢',
      CASH: '💵',
      CRYPTO: '₿',
      LOAN: '🏠',
      PENSION: '🎯',
      OTHER: '📋',
    };
    return iconMap[type] || '💳';
  }

  function resetForm() {
    // Store current values if we want to keep them
    if (keepLastValues) {
      lastUsedAccount = newTransactionAccountId;
      lastUsedCategory = newTransactionCategoryId;
      lastUsedDate = newTransactionDate;
    }

    // Increment counter in quick mode
    if (quickEntryMode) {
      transactionCount++;
    }

    newTransactionDescription = '';
    newTransactionAmount = 0;

    // In quick entry mode, keep some values
    if (quickEntryMode && keepLastValues) {
      newTransactionAccountId = lastUsedAccount;
      newTransactionCategoryId = lastUsedCategory;
      newTransactionDate = lastUsedDate;
    } else {
      newTransactionDate = new Date().toISOString().split('T')[0];
      newTransactionAccountId = '';
      newTransactionCategoryId = '';
    }

    newTransactionIsRecurrent = false;
    newTransactionRecurrenceInterval = 'MONTHLY';
    newTransactionInstallmentsTotal = null;
    newTransactionInstallmentsPaid = null;
    newTransactionInstallmentStartDate = null;
    isInstallmentTransaction = false;

    // Only close form if not in quick entry mode
    if (!quickEntryMode) {
      showForm = false;
    }
  }

  function toggleForm() {
    showForm = !showForm;
  }

  // Auto-set installments paid to 0 when installments total is set
  $: if (newTransactionInstallmentsTotal && !newTransactionInstallmentsPaid) {
    newTransactionInstallmentsPaid = 0;
  }

  // Auto-set installment start date to transaction date if not set
  $: if (
    newTransactionInstallmentsTotal &&
    !newTransactionInstallmentStartDate
  ) {
    newTransactionInstallmentStartDate = newTransactionDate;
  }

  // Sync checkbox with installment state
  $: isInstallmentTransaction = newTransactionInstallmentsTotal !== null;

  // Common transaction templates
  const templates = [
    {
      name: '🛒 Groceries',
      category: 'Food & Dining',
      amount: 50.0,
      type: 'EXPENSE',
    },
    {
      name: '⛽ Gas',
      category: 'Transportation',
      amount: 40.0,
      type: 'EXPENSE',
    },
    {
      name: '🍕 Lunch',
      category: 'Food & Dining',
      amount: 15.0,
      type: 'EXPENSE',
    },
    { name: '🏧 ATM', category: 'Cash', amount: 100.0, type: 'EXPENSE' },
    { name: '💰 Salary', category: 'Income', amount: 3000.0, type: 'INCOME' },
    { name: '💼 Freelance', category: 'Income', amount: 500.0, type: 'INCOME' },
  ];

  function applyTemplate(template: (typeof templates)[0]) {
    newTransactionDescription = template.name;
    newTransactionAmount = template.amount;

    // Find matching category by name
    const matchingCategory = categories.find(
      (c) =>
        c.name.toLowerCase().includes(template.category.toLowerCase()) ||
        template.category.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matchingCategory) {
      newTransactionCategoryId = matchingCategory.id;
    }
  }

  // Keyboard shortcuts handler
  function handleKeydown(event: KeyboardEvent) {
    if (!quickEntryMode || !showForm) return;

    // Only handle shortcuts when not typing in an input/textarea/select
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT'
    ) {
      return;
    }

    // Template shortcuts (1-6)
    if (event.key >= '1' && event.key <= '6') {
      event.preventDefault();
      const templateIndex = parseInt(event.key) - 1;
      if (templates[templateIndex]) {
        applyTemplate(templates[templateIndex]);
      }
    }

    // Toggle keep last values (k)
    if (event.key === 'k') {
      event.preventDefault();
      keepLastValues = !keepLastValues;
    }

    // Reset form (r)
    if (event.key === 'r') {
      event.preventDefault();
      resetForm();
    }
  }

  onMount(() => {
    // Add global keyboard listener
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  // Smart category suggestions based on description
  function getSuggestedCategory(description: string) {
    const desc = description.toLowerCase();

    const suggestions = {
      // Common expense keywords
      'grocery|supermarket|food|restaurant|cafe|pizza|lunch|dinner':
        categories.find(
          (c) =>
            c.name.toLowerCase().includes('food') ||
            c.name.toLowerCase().includes('grocery')
        ),
      'gas|fuel|gasoline|petrol': categories.find(
        (c) =>
          c.name.toLowerCase().includes('transport') ||
          c.name.toLowerCase().includes('fuel')
      ),
      'rent|mortgage|housing': categories.find(
        (c) =>
          c.name.toLowerCase().includes('housing') ||
          c.name.toLowerCase().includes('rent')
      ),
      'salary|paycheck|income|wage': categories.find(
        (c) => c.type === 'INCOME'
      ),
      'uber|taxi|transport|bus|metro': categories.find((c) =>
        c.name.toLowerCase().includes('transport')
      ),
      'netflix|spotify|subscription|disney': categories.find(
        (c) =>
          c.name.toLowerCase().includes('entertainment') ||
          c.name.toLowerCase().includes('subscription')
      ),
      'pharmacy|doctor|hospital|medical': categories.find(
        (c) =>
          c.name.toLowerCase().includes('health') ||
          c.name.toLowerCase().includes('medical')
      ),
    };

    for (const [keywords, category] of Object.entries(suggestions)) {
      const regex = new RegExp(keywords, 'i');
      if (regex.test(desc) && category) {
        return category.id;
      }
    }
    return '';
  }

  // Auto-suggest category when description changes
  $: if (newTransactionDescription && !newTransactionCategoryId) {
    const suggested = getSuggestedCategory(newTransactionDescription);
    if (suggested) {
      newTransactionCategoryId = suggested;
    }
  }

  // Quick amount presets
  const quickAmounts = [10, 25, 50, 100, 250, 500];

  function setQuickAmount(amount: number) {
    newTransactionAmount = amount;
  }

  // Keyboard shortcuts are handled by the onMount function above
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-semibold flex items-center gap-2">
      <span>💸</span>
      Add Transaction
      {#if quickEntryMode}
        <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
          >Quick Entry</span
        >
        {#if transactionCount > 0}
          <span
            class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full"
            >{transactionCount} added</span
          >
        {/if}
      {/if}
    </h2>
    <div class="flex items-center gap-2">
      <!-- Quick Entry Mode Toggle -->
      <button
        type="button"
        on:click={() => (quickEntryMode = !quickEntryMode)}
        class="px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2"
        class:bg-blue-600={quickEntryMode}
        class:text-white={quickEntryMode}
        class:hover:bg-blue-700={quickEntryMode}
        class:bg-gray-200={!quickEntryMode}
        class:text-gray-700={!quickEntryMode}
        class:hover:bg-gray-300={!quickEntryMode}
        title={quickEntryMode
          ? 'Exit quick entry mode'
          : 'Enable quick entry mode for multiple transactions'}
      >
        <span>⚡</span>
        {quickEntryMode ? 'Exit Quick Mode' : 'Quick Mode'}
      </button>

      <button
        type="button"
        on:click={toggleForm}
        title={showForm ? 'Close form' : 'Add new transaction'}
        class="px-3 py-2 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
      >
        <span class="text-xl">{showForm ? '−' : '+'}</span>
      </button>
    </div>
  </div>

  {#if showForm}
    <div transition:slide={{ duration: 300 }} class="border-t pt-6">
      <!-- Quick Templates (only in quick entry mode) -->
      {#if quickEntryMode}
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 class="text-sm font-medium text-blue-800 mb-3">
            ⚡ Quick Templates (Press 1-6)
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            {#each templates as template, index}
              <button
                type="button"
                on:click={() => applyTemplate(template)}
                class="p-2 text-xs bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors text-left"
                title="Press {index + 1} to apply this template"
              >
                <div class="font-medium">{template.name}</div>
                <div class="text-blue-600">
                  ${template.amount} • {template.category}
                </div>
                <div class="text-xs text-gray-500">Key: {index + 1}</div>
              </button>
            {/each}
          </div>

          <!-- Keyboard shortcuts hint -->
          <div class="mt-3 text-xs text-blue-600">
            💡 <strong>Shortcuts:</strong> 1-6 (templates) • K (toggle keep values)
            • R (reset)
          </div>
        </div>
      {/if}

      <form
        method="POST"
        action="?/addTransaction"
        use:enhance={({ formData }) => {
          return async ({ result }) => {
            if (result.type === 'failure') {
              showError(
                (result.data as any)?.error || 'Failed to add transaction'
              );
            } else if (result.type === 'success') {
              showSuccess('Transaction added successfully');
              resetForm();
              await invalidateAll();
            }
          };
        }}
        class="space-y-6"
      >
        <!-- Transaction Type Indicator -->
        {#if selectedCategory}
          <div
            class="flex items-center gap-2 p-3 rounded-lg {isIncome
              ? 'bg-green-50 border border-green-200'
              : isExpense
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'}"
          >
            <span class="text-lg"
              >{isIncome ? '💰' : isExpense ? '💸' : '💱'}</span
            >
            <span
              class="font-medium text-sm {isIncome
                ? 'text-green-700'
                : isExpense
                  ? 'text-red-700'
                  : 'text-gray-700'}"
            >
              {isIncome
                ? 'Income Transaction'
                : isExpense
                  ? 'Expense Transaction'
                  : 'Transaction'}
            </span>
          </div>
        {/if}

        <!-- Main Transaction Details - Grid Layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Description -->
          <div class="md:col-span-2">
            <label
              for="transaction-description"
              class="block text-sm font-medium text-gray-700 mb-2"
              >Description</label
            >
            <input
              id="transaction-description"
              type="text"
              name="description"
              placeholder="e.g., Grocery shopping, Salary payment"
              bind:value={newTransactionDescription}
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent transition-all duration-200"
              required
            />
            {#if newTransactionDescription && getSuggestedCategory(newTransactionDescription)}
              {@const suggestedCat = categories.find(
                (c) => c.id === getSuggestedCategory(newTransactionDescription)
              )}
              <div class="mt-1 text-xs text-green-600 flex items-center gap-1">
                <span>💡</span>
                <span
                  >Smart suggestion: {suggestedCat?.type === 'INCOME'
                    ? '💰'
                    : '💸'}
                  {suggestedCat?.name}</span
                >
              </div>
            {/if}
          </div>

          <!-- Amount -->
          <div>
            <label
              for="transaction-amount"
              class="block text-sm font-medium text-gray-700 mb-2">Amount</label
            >
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >$</span
              >
              <input
                id="transaction-amount"
                type="number"
                name="amount"
                placeholder="0.00"
                bind:value={newTransactionAmount}
                class="w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent transition-all duration-200"
                step="0.01"
                required
              />
            </div>
            <!-- Quick Amount Buttons -->
            <div class="flex flex-wrap gap-1 mt-2">
              {#each quickAmounts as amount}
                <button
                  type="button"
                  on:click={() => setQuickAmount(amount)}
                  class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border transition-colors"
                  >${amount}</button
                >
              {/each}
            </div>
          </div>

          <!-- Date -->
          <div>
            <label
              for="transaction-date"
              class="block text-sm font-medium text-gray-700 mb-2">Date</label
            >
            <input
              id="transaction-date"
              type="date"
              name="date"
              bind:value={newTransactionDate}
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <!-- Account -->
          <div>
            <label
              for="transaction-account"
              class="block text-sm font-medium text-gray-700 mb-2"
              >Account</label
            >
            <select
              id="transaction-account"
              name="accountId"
              bind:value={newTransactionAccountId}
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">💳 Select Account</option>
              {#each accounts as account}
                <option value={account.id}
                  >{getAccountIcon(account.type)} {account.name}</option
                >
              {/each}
            </select>
          </div>

          <!-- Category -->
          <div>
            <label
              for="transaction-category"
              class="block text-sm font-medium text-gray-700 mb-2"
              >Category</label
            >
            <select
              id="transaction-category"
              name="categoryId"
              bind:value={newTransactionCategoryId}
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">📁 Select Category</option>
              {#each categories as category}
                <option value={category.id}
                  >{category.type === 'INCOME' ? '💰' : '💸'}
                  {category.name}</option
                >
              {/each}
            </select>
          </div>
        </div>

        <!-- Advanced Options -->
        <div class="space-y-4 border-t pt-4">
          <div class="flex items-center justify-between">
            <h4
              class="text-md font-medium text-gray-800 flex items-center gap-2"
            >
              <span>⚙️</span>
              Advanced Options
            </h4>

            <!-- Quick Entry Controls -->
            {#if quickEntryMode}
              <div class="flex items-center gap-3 text-sm">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    bind:checked={keepLastValues}
                    class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="text-gray-700">Keep account & category</span>
                </label>
              </div>
            {/if}
          </div>

          <!-- Transaction Type Toggles -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Recurrent Transaction -->
            <div
              class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <input
                id="recurrent-checkbox"
                type="checkbox"
                name="isRecurrent"
                bind:checked={newTransactionIsRecurrent}
                class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div class="flex-1">
                <label
                  for="recurrent-checkbox"
                  class="text-sm font-medium text-blue-800 block"
                  >🔄 Recurrent Transaction</label
                >
                <p class="text-xs text-blue-600">
                  Automatically repeat this transaction
                </p>
              </div>
            </div>

            <!-- Installment Transaction -->
            <div
              class="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg"
            >
              <input
                id="installments-checkbox"
                type="checkbox"
                bind:checked={isInstallmentTransaction}
                on:change={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target?.checked) {
                    newTransactionInstallmentsTotal = 2;
                  } else {
                    newTransactionInstallmentsTotal = null;
                    newTransactionInstallmentsPaid = null;
                    newTransactionInstallmentStartDate = null;
                  }
                }}
                class="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div class="flex-1">
                <label
                  for="installments-checkbox"
                  class="text-sm font-medium text-purple-800 block"
                  >📅 Installment Transaction</label
                >
                <p class="text-xs text-purple-600">
                  Split into multiple payments
                </p>
              </div>
            </div>
          </div>

          <!-- Recurrence Options -->
          {#if newTransactionIsRecurrent}
            <div
              transition:slide={{ duration: 200 }}
              class="bg-blue-50 p-4 rounded-lg border border-blue-200"
            >
              <label
                for="recurrence-interval"
                class="block text-sm font-medium text-blue-800 mb-2"
                >Recurrence Interval</label
              >
              <select
                id="recurrence-interval"
                name="recurrenceInterval"
                bind:value={newTransactionRecurrenceInterval}
                class="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="MONTHLY">📅 Monthly</option>
                <option value="YEARLY">🗓️ Yearly</option>
              </select>
            </div>
          {/if}

          <!-- Installment Options -->
          {#if showInstallmentFields}
            <div
              transition:slide={{ duration: 200 }}
              class="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-4"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    for="installments-total"
                    class="block text-sm font-medium text-purple-800 mb-2"
                    >Total Installments</label
                  >
                  <input
                    id="installments-total"
                    type="number"
                    name="installmentsTotal"
                    placeholder="Total Installments"
                    bind:value={newTransactionInstallmentsTotal}
                    class="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    min="2"
                    max="60"
                  />
                </div>

                <div>
                  <label
                    for="installments-paid"
                    class="block text-sm font-medium text-purple-800 mb-2"
                    >Already Paid</label
                  >
                  <input
                    id="installments-paid"
                    type="number"
                    name="installmentsPaid"
                    placeholder="0"
                    bind:value={newTransactionInstallmentsPaid}
                    class="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    min="0"
                    max={newTransactionInstallmentsTotal || 0}
                  />
                </div>
              </div>

              <div>
                <label
                  for="installment-start-date"
                  class="block text-sm font-medium text-purple-800 mb-2"
                  >First Installment Date</label
                >
                <input
                  id="installment-start-date"
                  type="date"
                  name="installmentStartDate"
                  bind:value={newTransactionInstallmentStartDate}
                  class="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                />
              </div>

              <!-- Installment Preview -->
              {#if newTransactionInstallmentsTotal && newTransactionAmount}
                <div class="bg-white p-3 rounded border border-purple-200">
                  <p class="text-sm text-purple-700">
                    <strong>💡 Preview:</strong>
                    {newTransactionInstallmentsTotal} installments of
                    <strong
                      >${(
                        Math.abs(newTransactionAmount) /
                        newTransactionInstallmentsTotal
                      ).toFixed(2)}</strong
                    > each
                  </p>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <!-- Quick Entry Mode Additional Buttons -->
          {#if quickEntryMode}
            <button
              type="button"
              on:click={() => {
                // Duplicate the last transaction with empty description
                if (lastUsedAccount && lastUsedCategory) {
                  newTransactionAccountId = lastUsedAccount;
                  newTransactionCategoryId = lastUsedCategory;
                  newTransactionDate = lastUsedDate;
                  newTransactionDescription = '';
                  newTransactionAmount = 0;
                }
              }}
              class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              title="Use same account and category as last transaction"
            >
              📋 Same As Last
            </button>
          {/if}

          <button
            type="button"
            on:click={() => (showForm = false)}
            class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >Cancel</button
          >
          <button
            type="submit"
            disabled={!isFormValid}
            class="flex-1 px-4 py-3 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >{quickEntryMode
              ? '✅ Add & Continue'
              : '✅ Add Transaction'}</button
          >
        </div>
      </form>
    </div>
  {/if}
</div>
