<script lang="ts">
  import { projects } from "$lib/data/projects";
</script>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-4xl font-bold text-[var(--color-primary-default)] mb-8 text-center">My Projects</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {#each projects as project}
        <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold text-[var(--color-primary-default)] mb-2">{project.name}</h2>
          <p class="text-[var(--color-neutral-700)] mb-4">{project.description}</p>
          <a
            href={project.link}
            target="_blank"
            class="text-[var(--color-primary-accent)] hover:underline font-medium"
          >
            View Project &rarr;
          </a>
        </div>
      {/each}
    </div>
  </div>
</section>
