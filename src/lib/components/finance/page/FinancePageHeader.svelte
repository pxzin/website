<!-- Finance Page Header Component -->
<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<div class="flex justify-between items-center mb-8">
  <div class="flex items-center">
    <img
      src="/images/tools/logos/fintrack.png"
      alt="FinTrack - Financial Management Tool"
      class="h-16"
    />
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
