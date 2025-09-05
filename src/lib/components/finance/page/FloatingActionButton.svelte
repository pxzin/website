<!-- Floating Action Button Component -->
<script lang="ts">
  export let showFABMenu: boolean = false;
  export let toggleFABMenu: () => void;
  export let openFormDrawerFromFAB: (
    formType: 'account' | 'category' | 'transaction'
  ) => void;
</script>

<!-- Global event listener for clicking outside FAB -->
<svelte:window
  on:click={(event) => {
    const target = event.target as Element;
    if (!target.closest('.fab-container')) {
      showFABMenu = false;
    }
  }}
/>

<!-- Floating Action Button -->
<!-- Subtle backdrop when FAB menu is open -->
{#if showFABMenu}
  <div
    class="fixed inset-0 z-20 bg-black/10 backdrop-blur-sm transition-all duration-300"
  ></div>
{/if}

<div class="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30 fab-container">
  <!-- FAB Menu Options -->
  {#if showFABMenu}
    <div
      class="absolute bottom-16 right-0 space-y-3 transition-all duration-300 transform"
    >
      <!-- Add Transaction -->
      <div class="animate-in slide-in-from-right-5 duration-300 delay-0">
        <button
          on:click={() => openFormDrawerFromFAB('transaction')}
          class="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <span class="mr-2">💰</span>
          <span class="text-xs md:text-sm font-medium whitespace-nowrap"
            >Add Transaction</span
          >
        </button>
      </div>

      <!-- Add Category -->
      <div class="animate-in slide-in-from-right-5 duration-300 delay-75">
        <button
          on:click={() => openFormDrawerFromFAB('category')}
          class="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <span class="mr-2">🏷️</span>
          <span class="text-xs md:text-sm font-medium whitespace-nowrap"
            >Add Category</span
          >
        </button>
      </div>

      <!-- Add Account -->
      <div class="animate-in slide-in-from-right-5 duration-300 delay-150">
        <button
          on:click={() => openFormDrawerFromFAB('account')}
          class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <span class="mr-2">🏦</span>
          <span class="text-xs md:text-sm font-medium whitespace-nowrap"
            >Add Account</span
          >
        </button>
      </div>
    </div>
  {/if}

  <!-- Main FAB Button -->
  <button
    on:click={toggleFABMenu}
    class="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group transform hover:scale-110"
    aria-label="Quick Actions"
  >
    <span
      class="text-xl md:text-2xl transition-transform duration-300"
      class:rotate-45={showFABMenu}
    >
      {showFABMenu ? '✕' : '+'}
    </span>
  </button>
</div>
