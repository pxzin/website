<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  export let show = false;
  export let title = '';
  export let maxWidth = 'max-w-2xl';
  export let closeOnClickOutside = true;
  export let allowOverflow = false;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (closeOnClickOutside && event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-lg shadow-xl w-full {maxWidth} max-h-[90vh] {allowOverflow
        ? 'overflow-visible'
        : 'overflow-hidden'}"
      transition:fly={{ y: 20, duration: 200 }}
      on:click|stopPropagation
    >
      <!-- Header -->
      {#if title || $$slots.header}
        <div
          class="flex items-center justify-between p-6 border-b border-gray-200"
        >
          <div class="flex items-center gap-3">
            {#if $$slots.header}
              <slot name="header" />
            {:else if title}
              <h2 id="modal-title" class="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            {/if}
          </div>
          <button
            type="button"
            on:click={handleClose}
            class="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
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
              />
            </svg>
          </button>
        </div>
      {/if}

      <!-- Body -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)] relative">
        <slot />
      </div>

      <!-- Footer -->
      {#if $$slots.footer}
        <div class="border-t border-gray-200 p-6 bg-gray-50">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  :global(body.modal-open) {
    overflow: hidden;
  }
</style>
