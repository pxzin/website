<script lang="ts">
  export let items: any[] = [];
  export let itemsPerView = 3;
  export let gap = 16; // gap between items in pixels

  let currentIndex = 0;
  let carouselContainer: HTMLDivElement;
  let itemWidth = 0;

  $: maxIndex = Math.max(0, items.length - itemsPerView);
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
</script>

<div class="carousel-container relative">
  <!-- Navigation Buttons -->
  {#if items.length > itemsPerView}
    <button
      class="carousel-btn carousel-btn-prev absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200"
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
      class="carousel-btn carousel-btn-next absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200"
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
      bind:this={carouselContainer}
      class="carousel-track flex transition-transform duration-300 ease-out"
      style="transform: translateX(-{translateX}%); gap: {gap}px;"
    >
      {#each items as item, index}
        <div
          class="carousel-item flex-shrink-0"
          style="width: calc({100 / itemsPerView}% - {(gap *
            (itemsPerView - 1)) /
            itemsPerView}px)"
        >
          <slot {item} {index} />
        </div>
      {/each}
    </div>
  </div>

  <!-- Indicators -->
  {#if items.length > itemsPerView}
    <div class="carousel-indicators flex justify-center space-x-2 mt-4">
      {#each Array(maxIndex + 1) as _, index}
        <button
          class="indicator w-2 h-2 rounded-full transition-all duration-200"
          class:bg-blue-500={index === currentIndex}
          class:bg-gray-300={index !== currentIndex}
          on:click={() => goToIndex(index)}
          aria-label="Go to page {index + 1}"
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .carousel-container {
    width: 100%;
  }

  .carousel-btn:disabled {
    pointer-events: none;
  }

  .carousel-btn:hover:not(:disabled) {
    transform: translateY(-50%) scale(1.05);
  }

  .indicator:hover {
    transform: scale(1.2);
  }
</style>
