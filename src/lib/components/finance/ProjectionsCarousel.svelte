<script lang="ts">
  import { fade } from 'svelte/transition';
  import ProjectionCard from './ProjectionCard.svelte';

  export let projections: any[];
  export let getCategoryType: (categoryId: string) => string;
  export let formatRecurrenceInterval: (interval: string) => string;
  export let onRefreshProjections: (() => Promise<void>) | undefined =
    undefined;
  export let onDebugData: (() => Promise<void>) | undefined = undefined;

  let currentIndex = 0;
  const itemsPerView = 2;

  $: maxIndex = Math.max(0, Math.ceil(projections.length / itemsPerView) - 1);
  $: canGoNext = currentIndex < maxIndex;
  $: canGoPrev = currentIndex > 0;

  function next() {
    if (canGoNext) {
      currentIndex = Math.min(currentIndex + 1, maxIndex);
    }
  }

  function prev() {
    if (canGoPrev) {
      currentIndex = Math.max(currentIndex - 1, 0);
    }
  }

  function goToIndex(index: number) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));
  }

  $: translateX = currentIndex * (100 / itemsPerView);
  $: visibleProjections = projections.slice(
    currentIndex,
    currentIndex + itemsPerView
  );
</script>

<div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <div>
      <h2 class="text-2xl font-semibold">📊 Projections</h2>
      <p class="text-sm text-gray-600 mt-1">
        {projections.length} months projected • Based on current accounts & transactions
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <!-- Debug Button (temporary) -->
      {#if onDebugData}
        <button
          type="button"
          on:click={onDebugData}
          class="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
          title="Debug current data"
        >
          🐛 Debug
        </button>
      {/if}

      <!-- Refresh Projections Button -->
      <button
        type="button"
        on:click={onRefreshProjections}
        disabled={!onRefreshProjections}
        class="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
        title="Recalculate projections based on current data"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>
    </div>
  </div>

  {#if projections.length > 0}
    <div
      class="carousel-container relative"
      in:fade={{ duration: 600, delay: 200 }}
    >
      <!-- Navigation Buttons -->
      {#if projections.length > itemsPerView}
        <button
          class="carousel-btn carousel-btn-prev absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95"
          class:opacity-50={!canGoPrev}
          class:cursor-not-allowed={!canGoPrev}
          disabled={!canGoPrev}
          on:click={prev}
          aria-label="Previous items"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>

        <button
          class="carousel-btn carousel-btn-next absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95"
          class:opacity-50={!canGoNext}
          class:cursor-not-allowed={!canGoNext}
          disabled={!canGoNext}
          on:click={next}
          aria-label="Next items"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      {/if}

      <!-- Carousel Content -->
      <div class="carousel-viewport overflow-hidden">
        <div
          class="flex transition-transform duration-500 ease-out"
          style="transform: translateX(-{currentIndex * 100}%)"
        >
          {#each Array.from( { length: Math.ceil(projections.length / itemsPerView) } ) as _, pageIndex}
            <div class="flex-shrink-0 w-full grid grid-cols-2 gap-4">
              {#each projections.slice(pageIndex * itemsPerView, (pageIndex + 1) * itemsPerView) as projection}
                <div class="h-full">
                  <ProjectionCard
                    {projection}
                    {getCategoryType}
                    {formatRecurrenceInterval}
                  />
                </div>
              {/each}
              {#if projections.slice(pageIndex * itemsPerView, (pageIndex + 1) * itemsPerView).length === 1}
                <div class="h-full"></div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Indicators -->
      {#if projections.length > itemsPerView}
        <div
          class="carousel-indicators flex justify-center space-x-2 mt-4"
          in:fade={{ duration: 400, delay: 400 }}
        >
          {#each Array(maxIndex + 1) as _, index}
            <button
              class="indicator w-2 h-2 rounded-full transition-all duration-200 hover:scale-125 active:scale-90"
              class:bg-blue-500={index === currentIndex}
              class:bg-gray-300={index !== currentIndex}
              class:scale-125={index === currentIndex}
              on:click={() => goToIndex(index)}
              aria-label="Go to page {index + 1}"
            ></button>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div
      class="text-center text-gray-500 p-8 border-2 border-dashed border-gray-200 rounded-lg"
    >
      <div class="text-6xl mb-4">📊</div>
      <h3 class="text-lg font-medium text-gray-700 mb-2">
        No Projections Available
      </h3>
      <p class="text-sm mb-4">
        Projections are calculated based on your accounts and transactions.
      </p>
      <div class="text-xs text-gray-600 space-y-1">
        <p>• Add accounts to set starting balances</p>
        <p>• Add recurring transactions for monthly projections</p>
        <p>• Add installment transactions for future commitments</p>
        <p>• Use the refresh button if you added data recently</p>
      </div>
    </div>
  {/if}
</div>
