<script>
  const name = "Ricardo José";
  const title = "Software Engineer - Frontend specialist";
</script>

<div class="flex items-center justify-center h-screen bg-gray-100">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-800">{name}</h1>
    <p class="mt-2 text-xl text-gray-600">{title}</p>
  </div>
</div>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
