<script lang="ts">
  import { fade } from 'svelte/transition';
  import ProjectionCard from './ProjectionCard.svelte';

  export let projections: any[];
  export let getCategoryType: (categoryId: string) => string;
  export let formatRecurrenceInterval: (interval: string) => string;

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
  <h2 class="text-2xl font-semibold mb-4">Projections</h2>

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
    <div class="text-center text-gray-500 italic p-8">
      No projections available. Add some transactions to see projections.
    </div>
  {/if}
</div>
