<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;
</script>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-2xl mx-auto px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-[var(--color-primary-default)]">To-Do List</h1>
      <form method="POST" action="/login?/logout" use:enhance>
        <button type="submit" class="text-sm text-gray-600 hover:text-primary-default">Logout</button>
      </form>
    </div>

    <form method="POST" action="?/add" use:enhance class="mb-8">
      <div class="flex items-center">
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
          <form method="POST" action="?/toggle" use:enhance class="flex items-center flex-grow">
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="completed" value={todo.completed} />
            <input 
              type="checkbox" 
              checked={todo.completed}
              class="h-6 w-6 mr-4 rounded border-gray-300 text-primary-default focus:ring-primary-accent"
              on:change={(e) => e.currentTarget.form?.requestSubmit()}
            />
            <span class="text-lg flex-grow" class:line-through={todo.completed}>{todo.text}</span>
          </form>
          <form method="POST" action="?/delete" use:enhance class="ml-4">
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