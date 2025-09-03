<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let title: string = '';
  export let message: string;
  export let duration: number = 5000; // 5 seconds default
  export let onClose: (() => void) | undefined = undefined;

  let visible = true;
  let timeoutId: any;

  // Auto close after duration
  if (duration > 0) {
    timeoutId = setTimeout(() => {
      close();
    }, duration);
  }

  function close() {
    visible = false;
    clearTimeout(timeoutId);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for exit animation
  }

  // Toast styles based on type
  $: toastStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: '✅',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      closeColor: 'text-green-400 hover:text-green-600',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: '❌',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      closeColor: 'text-red-400 hover:text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: '⚠️',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
      closeColor: 'text-yellow-400 hover:text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'ℹ️',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
      closeColor: 'text-blue-400 hover:text-blue-600',
    },
  };

  $: currentStyle = toastStyles[type];
</script>

{#if visible}
  <div
    class="max-w-sm w-full"
    in:fly={{ x: 300, duration: 300, easing: quintOut }}
    out:fly={{ x: 300, duration: 300, easing: quintOut }}
  >
    <div class="border rounded-lg shadow-lg p-4 {currentStyle.bg}">
      <div class="flex items-start">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <span class="text-xl {currentStyle.iconColor}">
            {currentStyle.icon}
          </span>
        </div>

        <!-- Content -->
        <div class="ml-3 flex-1">
          {#if title}
            <h3 class="text-sm font-semibold {currentStyle.titleColor}">
              {title}
            </h3>
          {/if}
          <p class="text-sm {currentStyle.messageColor} {title ? 'mt-1' : ''}">
            {message}
          </p>
        </div>

        <!-- Close button -->
        <div class="ml-4 flex-shrink-0">
          <button
            type="button"
            class="inline-flex {currentStyle.closeColor} hover:scale-110 transition-all duration-200"
            on:click={close}
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Progress bar for timed toasts -->
      {#if duration > 0}
        <div class="mt-3 w-full bg-white/30 rounded-full h-1 overflow-hidden">
          <div
            class="progress-bar h-1 rounded-full {type === 'success'
              ? 'bg-green-400'
              : type === 'error'
                ? 'bg-red-400'
                : type === 'warning'
                  ? 'bg-yellow-400'
                  : 'bg-blue-400'}"
            style="--duration: {duration}ms;"
          ></div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .progress-bar {
    width: 100%;
    animation: shrink var(--duration) linear forwards;
  }

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
</style>
