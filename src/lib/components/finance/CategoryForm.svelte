<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { tick } from 'svelte';
  import { showError, showSuccess } from '$lib/stores/toast';

  export let categories: any[] = [];
  export let showForm = false;

  // Auto-show form when component is mounted
  import { onMount } from 'svelte';
  onMount(() => {
    showForm = true;
  });

  let newCategoryName = '';
  let selectedIcon = '📁';
  let formKey = 0; // Add a key to force re-render
  let isSubmitting = false;
  let showIconPicker = false;

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
    formKey += 1; // Force re-render
  }

  function selectIcon(icon: string) {
    selectedIcon = icon;
    showIconPicker = false;
  }

  function toggleIconPicker() {
    showIconPicker = !showIconPicker;
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

{#if showForm}
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold flex items-center gap-2">
        📂 Categories
      </h2>
    </div>

    <!-- Add New Category Form -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="text-lg font-medium mb-4">Add New Category</h3>
      {#key formKey}
        <form on:submit={handleSubmit} class="space-y-4">
          <!-- Category Name -->
          <div>
            <label for="categoryName" class="block text-sm font-medium mb-2">
              Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              bind:value={newCategoryName}
              placeholder="e.g., Groceries, Salary"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>

          <!-- Category Icon -->
          <div>
            <label class="block text-sm font-medium mb-2">
              Category Icon
            </label>
            <div class="relative">
              <button
                type="button"
                on:click={toggleIconPicker}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between text-left"
                disabled={isSubmitting}
              >
                <span class="flex items-center gap-2">
                  <span class="text-xl">{selectedIcon}</span>
                  <span>Click to select icon</span>
                </span>
                <span class="text-gray-400">▼</span>
              </button>

              {#if showIconPicker}
                <div
                  class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-3 grid grid-cols-6 gap-2 max-h-48 overflow-y-auto"
                >
                  {#each availableIcons as icon}
                    <button
                      type="button"
                      on:click={() => selectIcon(icon)}
                      class="p-2 text-xl hover:bg-gray-100 rounded transition-colors {selectedIcon ===
                      icon
                        ? 'bg-blue-100 ring-2 ring-blue-500'
                        : ''}"
                    >
                      {icon}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="submit"
              class="px-4 py-2 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </button>
            <button
              type="button"
              on:click={resetForm}
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      {/key}
    </div>

    <!-- Existing Categories List -->
    <div>
      <h3 class="text-lg font-medium mb-4">Existing Categories</h3>
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
  </div>
{/if}
