<!-- Finance Page Header Component -->
<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<div class="flex justify-between items-center mb-8">
  <h1 class="text-4xl font-bold text-[var(--color-primary-default)]">
    Financial Overview
  </h1>
  <form method="POST" action="/login?/logout" use:enhance>
    <button
      type="submit"
      class="text-sm text-gray-600 hover:text-primary-default"
    >
      Logout
    </button>
  </form>
</div>
