<script>
  const projects = [
    {
      name: "Clock-in Helper",
      description: "Chrome extension to streamline hour logging on Beefor.",
      link: "https://github.com/your-username/clock-in-helper",
    },
    {
      name: "Personal Website",
      description: "Minimalist website built with SvelteKit and TailwindCSS.",
      link: "https://ricardojose.com.br",
    },
  ];
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
  <div class="max-w-4xl p-8 text-center bg-white rounded-lg shadow-lg">
    <h1 class="text-3xl font-bold text-gray-800">My Projects</h1>
    <div class="mt-6 space-y-4">
      {#each projects as project}
        <div class="p-4 bg-gray-50 rounded-md shadow">
          <h2 class="text-xl font-semibold text-gray-800">{project.name}</h2>
          <p class="mt-2 text-gray-600">{project.description}</p>
          <a
            href={project.link}
            target="_blank"
            class="mt-4 inline-block text-blue-600 hover:underline"
          >
            View on GitHub
          </a>
        </div>
      {/each}
    </div>
  </div>
</div>
