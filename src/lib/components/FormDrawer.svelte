<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let show = false;

  const dispatch = createEventDispatcher();

  function closeDrawer() {
    show = false;
    dispatch('close');
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeDrawer();
    }
  }
</script>

<!-- Overlay -->
{#if show}
  <div
    class="fixed inset-0 z-40 transition-opacity duration-300"
    style="background-color: rgba(0, 0, 0, 0.5);"
    on:click={handleOverlayClick}
    on:keydown={(e) => e.key === 'Escape' && closeDrawer()}
    role="button"
    tabindex="0"
  ></div>
{/if}

<!-- Drawer -->
<div
  class="fixed top-0 left-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
  class:translate-x-0={show}
  class:-translate-x-full={!show}
>
  <div class="p-6">
    <!-- Header -->
    <div
      class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4"
    >
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>📝</span>
        Add Data
      </h2>
      <button
        on:click={closeDrawer}
        class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        title="Close menu"
      >
        <svg
          class="w-6 h-6 text-gray-500"
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

    <!-- Forms Section -->
    <div class="space-y-6">
      <slot />
    </div>
  </div>
</div>
