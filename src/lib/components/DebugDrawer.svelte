<script lang="ts">
  import { dev } from '$app/environment';
  import { slide } from 'svelte/transition';
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
