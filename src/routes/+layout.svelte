<script lang="ts">
  import "../tailwind.css";
  import "../app.css";
  import Nav from "$lib/components/Nav/Nav.svelte";

  export let data;
  const appVersion = data.appVersion;
</script>

<Nav />
<slot />

<footer class="bg-gray-800 text-white p-4 text-center mt-8">
  <p class="text-sm">
    Application Version: {appVersion} |
    <a href="/changelog" class="text-blue-400 hover:underline">Changelog</a>
  </p>
</footer>
