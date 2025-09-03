<script lang="ts">
  import { toasts, removeToast } from '$lib/stores/toast';
  import Toast from '$lib/components/Toast.svelte';
</script>

<div
  class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none"
>
  {#each $toasts as toast (toast.id)}
    <div class="pointer-events-auto">
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={toast.duration}
        onClose={() => removeToast(toast.id)}
      />
    </div>
  {/each}
</div>
