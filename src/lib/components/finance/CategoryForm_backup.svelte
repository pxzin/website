<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { showError, showSuccess } from '$lib/stores/toast';
  import Modal from '$lib/components/Modal.svelte';

  export let categories: any[] = [];
  export let showForm = false;
  export let hideListSection = false; // New prop to hide the list section
  export let transactions: any[] = []; // Add transactions prop to calculate category balances

  // Calculate category usage and balances
  $: categoryStats = categories
    .map((category) => {
      const categoryTransactions = transactions.filter(
        (tx) => tx.category_id === category.id
      );
      const totalAmount = categoryTransactions.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );
      const transactionCount = categoryTransactions.length;

      return {
        ...category,
        totalAmount,
        transactionCount,
        isActive: transactionCount > 0,
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // Overall statistics
  $: totalTransactions = transactions.length;
  $: usedCategories = categoryStats.filter((cat) => cat.isActive);
  $: unusedCategories = categoryStats.filter((cat) => !cat.isActive);
  $: topCategory = categoryStats.find((cat) => cat.isActive);

  let newCategoryName = '';
  let selectedIcon = '📁';
  let isSubmitting = false;
  let showIconPicker = false;
  let showIconModal = false;

  // Available icons for categories
  const availableIcons = [
    '💰',
    '🏠',
    '🍽️',
    '🚗',
    '🎮',
    '👕',
    '💊',
    '🎓',
    '✈️',
    '🎬',
    '🏋️',
    '🐕',
    '🎁',
    '🔧',
    '📱',
    '☕',
    '🌟',
    '💻',
    '🎨',
    '📚',
    '🎵',
    '🏖️',
    '🔑',
    '📁',
  ];

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!newCategoryName.trim()) {
      showError('Category name is required');
      return;
    }

    isSubmitting = true;

    try {
      const formData = new FormData();
      formData.append('name', newCategoryName.trim());
      formData.append('icon', selectedIcon);

      const response = await fetch('/tools/finance?/addCategory', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showSuccess('Category added successfully!');
        await invalidateAll();
        resetForm();
      } else {
        const result = await response.json();
        showError(result.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      showError('Failed to add category');
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    newCategoryName = '';
    selectedIcon = '📁';
    showForm = false;
  }

  function handleClose() {
    showForm = false;
  }

  function toggleIconPicker() {
    showIconModal = true;
  }

  function selectIcon(icon: string) {
    selectedIcon = icon;
    showIconModal = false;
  }
</script>

<!-- Modal para adicionar categoria -->
<Modal bind:show={showForm} on:close={handleClose} maxWidth="max-w-md">
  <svelte:fragment slot="header">
    <div class="flex items-center gap-3">
      <span class="text-2xl">📂</span>
      <h2 class="text-xl font-semibold text-gray-900">Add Category</h2>
    </div>
  </svelte:fragment>

  <form on:submit={handleSubmit} class="space-y-4">
    <!-- Category Name -->
    <div>
      <label
        for="category-name"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Category Name
      </label>
      <input
        id="category-name"
        type="text"
        placeholder="e.g., Groceries, Rent, Salary"
        bind:value={newCategoryName}
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
        required
        disabled={isSubmitting}
      />
    </div>

    <!-- Category Icon -->
    <div>
      <label
        for="iconPicker"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Category Icon
      </label>
      <button
        id="iconPicker"
        type="button"
        on:click={toggleIconPicker}
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent flex items-center justify-between text-left hover:bg-gray-50"
        disabled={isSubmitting}
      >
        <span class="flex items-center gap-2">
          <span class="text-xl">{selectedIcon}</span>
          <span>Click to select icon</span>
        </span>
        <span class="text-gray-400">🔍</span>
      </button>
    </div>

    <div class="flex gap-2 pt-4">
      <button
        type="submit"
        class="flex-1 px-4 py-2 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Category'}
      </button>
      <button
        type="button"
        on:click={handleClose}
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200"
        disabled={isSubmitting}
      >
        Cancel
      </button>
    </div>
  </form>
</Modal>

<!-- Modal para seleção de ícones -->
<Modal
  bind:show={showIconModal}
  on:close={() => (showIconModal = false)}
  maxWidth="max-w-lg"
>
  <svelte:fragment slot="header">
    <div class="flex items-center gap-3">
      <span class="text-2xl">🎨</span>
      <h2 class="text-xl font-semibold text-gray-900">Select Icon</h2>
    </div>
  </svelte:fragment>

  <div class="flex justify-center">
    <div class="grid grid-cols-8 gap-3 max-w-fit">
      {#each availableIcons as icon}
        <button
          type="button"
          on:click={() => selectIcon(icon)}
          class="p-4 text-2xl hover:bg-gray-100 rounded-lg transition-colors border-2 w-14 h-14 flex items-center justify-center {selectedIcon ===
          icon
            ? 'bg-blue-50 border-blue-500'
            : 'border-transparent hover:border-gray-300'}"
        >
          {icon}
        </button>
      {/each}
    </div>
  </div>

  <svelte:fragment slot="footer">
    <div class="flex gap-2 justify-end">
      <button
        type="button"
        on:click={() => (showIconModal = false)}
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200"
      >
        Cancel
      </button>
      <button
        type="button"
        on:click={() => (showIconModal = false)}
        class="px-4 py-2 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200"
      >
        Done
      </button>
    </div>
  </svelte:fragment>
</Modal>

<!-- Lista de categorias -->
{#if !hideListSection}
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2
            class="text-2xl font-semibold flex items-center gap-2 text-gray-900"
          >
            <span>📂</span>
            Categories Overview
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} •
            Organize your transactions
          </p>
        </div>
        <button
          type="button"
          on:click={() => (showForm = true)}
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <span>➕</span>
          Add Category
        </button>
      </div>

      {#if categories.length === 0}
        <div class="text-center py-12 text-gray-500">
          <div class="text-6xl mb-4">📂</div>
          <h3 class="text-lg font-medium text-gray-700 mb-2">
            No categories yet
          </h3>
          <p class="text-sm mb-4">
            Create categories to organize your income and expenses
          </p>
          <button
            type="button"
            on:click={() => (showForm = true)}
            class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
          >
            <span>➕</span>
            Create First Category
          </button>
        </div>
      {:else}
        <!-- Category Statistics -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div
            class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
          >
            <div class="flex items-center gap-2">
              <span class="text-2xl">📊</span>
              <div>
                <div class="text-sm font-medium text-blue-800">
                  Active Categories
                </div>
                <div class="text-lg font-bold text-blue-600">
                  {usedCategories.length}/{categories.length}
                </div>
              </div>
            </div>
          </div>
          <div
            class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
          >
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏆</span>
              <div>
                <div class="text-sm font-medium text-green-800">
                  Top Category
                </div>
                <div class="text-sm font-bold text-green-600 truncate">
                  {topCategory
                    ? `${topCategory.icon} ${topCategory.name}`
                    : 'None'}
                </div>
              </div>
            </div>
          </div>
          <div
            class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
          >
            <div class="flex items-center gap-2">
              <span class="text-2xl">💰</span>
              <div>
                <div class="text-sm font-medium text-purple-800">
                  Total Flow
                </div>
                <div class="text-lg font-bold text-purple-600">
                  ${Math.abs(
                    categoryStats.reduce((sum, cat) => sum + cat.totalAmount, 0)
                  ).toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {#each categoryStats as category}
            <div
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200 group"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">{category.icon || '📁'}</span>
                <div>
                  <div class="font-medium text-gray-900">{category.name}</div>
                  <div class="text-xs text-gray-500">
                    {category.transactionCount} transaction{category.transactionCount !==
                    1
                      ? 's'
                      : ''}
                    {#if category.isActive}
                      • <span
                        class="font-medium {category.totalAmount >= 0
                          ? 'text-green-600'
                          : 'text-red-600'}"
                      >
                        ${category.totalAmount.toFixed(2)}
                      </span>
                    {:else}
                      • <span class="text-gray-400">Unused</span>
                    {/if}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                {#if category.isActive}
                  <div class="w-2 h-2 rounded-full bg-green-400"></div>
                {:else}
                  <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                {/if}
                <form
                  method="POST"
                  action="?/deleteCategory"
                  use:enhance={({ formData }) => {
                    return async ({ result }: any) => {
                      if (result.type === 'failure') {
                        const errorMessage =
                          result.data?.error || 'Failed to delete category';
                        if (errorMessage.includes('existing transactions')) {
                          showError(
                            'Cannot delete a category that has transactions. Please delete the associated transactions first.'
                          );
                        } else {
                          showError(errorMessage);
                        }
                      } else if (result.type === 'success') {
                        showSuccess('Category deleted successfully!');
                        await invalidateAll();
                      }
                    };
                  }}
                  class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <input type="hidden" name="categoryId" value={category.id} />
                  <button
                    type="submit"
                    class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                    title="Delete category"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
