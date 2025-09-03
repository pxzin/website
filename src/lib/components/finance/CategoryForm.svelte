<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { showError, showSuccess } from '$lib/stores/toast';

  export let categories: any[] = [];
  export let showForm = false;

  let newCategoryName = '';
  let newCategoryType = 'EXPENSE';

  function resetForm() {
    newCategoryName = '';
    newCategoryType = 'EXPENSE';
    showForm = false;
  }

  function toggleForm() {
    showForm = !showForm;
  }
</script>

<div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-semibold flex items-center gap-2">
      <span>📂</span>
      Categories
    </h2>
    <button
      type="button"
      on:click={toggleForm}
      title={showForm ? 'Close form' : 'Add new category'}
      class="px-3 py-2 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
    >
      <span class="text-xl">{showForm ? '−' : '+'}</span>
    </button>
  </div>

  {#if showForm}
    <div transition:slide={{ duration: 300 }} class="mb-6 border-b pb-6">
      <form
        method="POST"
        action="?/addCategory"
        use:enhance={({ formData }) => {
          return async ({ result }) => {
            if (result.type === 'failure') {
              showError(result.data?.error || 'Failed to add category');
            } else if (result.type === 'success') {
              showSuccess('Category added successfully');
              resetForm();
              await invalidateAll();
            }
          };
        }}
        class="space-y-4"
      >
        <h3 class="text-lg font-semibold mb-3">Add New Category</h3>
        <div>
          <label
            for="category-name"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Category Name</label
          >
          <input
            id="category-name"
            type="text"
            name="name"
            placeholder="e.g., Groceries, Salary"
            bind:value={newCategoryName}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label
            for="category-type"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Category Type</label
          >
          <select
            id="category-type"
            name="type"
            bind:value={newCategoryType}
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary-accent)] focus:border-transparent"
          >
            <option value="EXPENSE">💸 Expense</option>
            <option value="INCOME">💰 Income</option>
          </select>
        </div>
        <div class="flex gap-2 pt-2">
          <button
            type="submit"
            class="px-4 py-2 bg-[var(--color-primary-accent)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Add Category
          </button>
          <button
            type="button"
            on:click={resetForm}
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  {/if}

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
            {#if category.type === 'INCOME'}
              <span class="text-2xl">💰</span>
              <div>
                <span class="font-medium text-green-700">{category.name}</span>
                <span
                  class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2"
                  >INCOME</span
                >
              </div>
            {:else}
              <span class="text-2xl">💸</span>
              <div>
                <span class="font-medium text-red-700">{category.name}</span>
                <span
                  class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-2"
                  >EXPENSE</span
                >
              </div>
            {/if}
          </div>
          <form
            method="POST"
            action="?/deleteCategory"
            use:enhance={({ formData }) => {
              return async ({ result }) => {
                if (result.type === 'failure') {
                  showError(result.data?.error || 'Failed to delete category');
                } else if (result.type === 'success') {
                  showSuccess('Category deleted successfully');
                  await invalidateAll();
                }
              };
            }}
            class="inline"
          >
            <input type="hidden" name="categoryId" value={category.id} />
            <button
              type="submit"
              class="text-red-500 text-sm hover:underline p-1">✕</button
            >
          </form>
        </li>
      {/each}
    </ul>
  {/if}
</div>
