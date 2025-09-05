<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { showError, showSuccess } from '$lib/stores/toast';
  import Modal from '$lib/components/Modal.svelte';

  export let categories: any[] = [];
  export let showForm = false;

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
    showIconPicker = false;
    showForm = false;
  }

  function selectIcon(icon: string) {
    selectedIcon = icon;
    showIconModal = false;
  }

  function toggleIconPicker() {
    showIconModal = true;
  }

  function handleClose() {
    showForm = false;
  }

  async function handleDelete(categoryId: string) {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('categoryId', categoryId);

      const response = await fetch('/tools/finance?/deleteCategory', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showSuccess('Category deleted successfully!');
        await invalidateAll();
      } else {
        const result = await response.json();
        showError(result.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showError('Failed to delete category');
    }
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
        for="categoryName"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Category Name
      </label>
      <input
        id="categoryName"
        type="text"
        bind:value={newCategoryName}
        placeholder="e.g., Groceries, Salary"
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
<div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-semibold flex items-center gap-2">
      <span>📂</span>
      Categories
    </h2>
  </div>

  {#if categories.length === 0}
    <div class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">📂</div>
      <p>
        No categories yet. Add your first category to organize transactions!
      </p>
    </div>
  {:else}
    <ul class="space-y-2">
      {#each categories as category}
        <li
          class="flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">{category.icon || '📁'}</span>
            <div>
              <span class="font-medium text-gray-700">{category.name}</span>
            </div>
          </div>
          <button
            type="button"
            on:click={() => handleDelete(category.id)}
            class="text-red-500 text-sm hover:underline p-1"
          >
            ✕
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
