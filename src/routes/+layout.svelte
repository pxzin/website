<script lang="ts">
  import '../tailwind.css';
  import '../app.css';
  import Nav from '$lib/components/Nav/Nav.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import DebugDrawer from '$lib/components/DebugDrawer.svelte';

  const appVersion = import.meta.env.VITE_APP_VERSION;
</script>

<Nav />
<div class="pt-16">
  <slot />
</div>

<ToastContainer />
<DebugDrawer />

<footer class="bg-gray-800 text-white p-4 text-center mt-8">
  <p class="text-sm">
    Application Version: {appVersion} |
    <a href="/changelog" class="text-blue-400 hover:underline">Changelog</a>
  </p>
</footer>
