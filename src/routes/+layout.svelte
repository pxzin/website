<script>
  import "../tailwind.css";
  import "../app.css";
</script>

<nav class="flex justify-center space-x-4 bg-gray-800 p-4">
  <a href="/" class="text-white">Home</a>
  <a href="/about" class="text-white">About</a>
  <a href="/projects" class="text-white">Projects</a>
  <a href="/contact" class="text-white">Contact</a>
</nav>

<slot />
