<script>
  import "../tailwind.css";
  import "../app.css";
  import Nav from "$lib/components/Nav/Nav.svelte";
</script>

<Nav />
<slot />

<footer>
  <p>Version: 0.0.0</p>
</footer>
