<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;
</script>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-2xl mx-auto px-4">
    <h1 class="text-4xl font-bold text-[var(--color-primary-default)] mb-8 text-center">To-Do List</h1>

    <form method="POST" action="?/add" use:enhance>
      <div class="flex items-center mb-8">
        <input
          type="text"
          name="text"
          class="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-primary-accent focus:border-primary-accent"
          placeholder="Add a new task"
        />
        <button
          type="submit"
          class="bg-[var(--color-primary-accent)] text-white p-2 rounded-r-md hover:bg-opacity-90"
        >
          Add
        </button>
      </div>
    </form>

    <ul class="space-y-4">
      {#each data.todos as todo}
        <li class="flex items-center justify-between p-4 bg-[var(--color-neutral-50)] rounded-lg shadow-md">
          <span class="text-lg">{todo.text}</span>
          <form method="POST" action="?/delete" use:enhance>
            <input type="hidden" name="id" value={todo.id} />
            <button
              type="submit"
              class="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </form>
        </li>
      {/each}
    </ul>
  </div>
</section>
