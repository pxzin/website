<!-- Finance Page Header Component -->
<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<div class="flex justify-between items-center mb-8">
  <div class="flex items-center gap-6">
    <img
      src="/images/tools/logos/fintrack.png"
      alt="FinTrack - Financial Management Tool"
      class="h-16"
    />
    <div class="hidden md:flex flex-col text-xs text-gray-500 space-y-1">
      <div class="font-medium text-gray-700">Atalhos Rápidos:</div>
      <div class="flex gap-4">
        <span><kbd class="bg-gray-100 px-1 rounded">Ctrl+T</kbd> Transação</span
        >
        <span><kbd class="bg-gray-100 px-1 rounded">Ctrl+K</kbd> Categoria</span
        >
        <span><kbd class="bg-gray-100 px-1 rounded">Ctrl+A</kbd> Conta</span>
      </div>
    </div>
  </div>
  <form method="POST" action="/login?/logout" use:enhance>
    <button
      type="submit"
      class="text-sm text-gray-600 hover:text-primary-default"
    >
      Logout
    </button>
  </form>
</div>
