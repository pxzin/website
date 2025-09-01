<script lang="ts">
  import { projects } from "$lib/data/projects";

  const name = "Ricardo José";
  const title = "Software Engineer - Frontend specialist";

  const featuredProjects = projects.filter(p => p.featured);
</script>

<section class="flex items-center justify-center min-h-screen py-16 bg-[var(--color-neutral-50)] text-center">
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-6xl md:text-7xl font-extrabold text-[var(--color-primary-default)] leading-tight mb-4">
      {name}
    </h1>
    <p class="text-2xl md:text-3xl text-[var(--color-neutral-700)] font-medium mb-8">
      {title}
    </p>
    <!-- Potentially add a subtle animation or call to action here later -->
  </div>
</section>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-4xl font-bold text-[var(--color-primary-default)] mb-6 text-center">About Me</h2>
    <p class="text-lg leading-relaxed mb-4">
      Hello! I'm Ricardo José, a passionate Software Engineer with a focus on frontend development.
      I thrive on building intuitive, performant, and accessible web applications that provide
      exceptional user experiences. My expertise spans across modern JavaScript frameworks,
      component-driven architectures, and robust testing methodologies.
    </p>
    <p class="text-lg leading-relaxed">
      I believe in continuous learning and staying updated with the latest industry trends to deliver
      cutting-edge solutions. My goal is to transform complex problems into elegant and efficient code.
    </p>
  </div>
</section>

<section class="py-16 bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)]">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-4xl font-bold text-[var(--color-primary-default)] mb-8 text-center">Skills</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div>
        <h3 class="text-2xl font-semibold text-[var(--color-primary-default)] mb-4">Frontend Development</h3>
        <ul class="list-disc list-inside space-y-2 text-lg">
          <li>SvelteKit, Svelte</li>
          <li>React, Next.js</li>
          <li>TypeScript, JavaScript</li>
          <li>Tailwind CSS, PostCSS</li>
          <li>HTML5, CSS3</li>
        </ul>
      </div>
      <div>
        <h3 class="text-2xl font-semibold text-[var(--color-primary-default)] mb-4">Backend Development</h3>
        <ul class="list-disc list-inside space-y-2 text-lg">
          <li>Node.js, Express.js</li>
          <li>Python, FastAPI</li>
          <li>RESTful APIs, GraphQL</li>
          <li>Database (PostgreSQL, MongoDB)</li>
        </ul>
      </div>
      <div>
        <h3 class="text-2xl font-semibold text-[var(--color-primary-default)] mb-4">Tools & Practices</h3>
        <ul class="list-disc list-inside space-y-2 text-lg">
          <li>Git, GitHub, GitLab</li>
          <li>Docker, CI/CD</li>
          <li>Unit, Integration, E2E Testing</li>
          <li>Agile Methodologies</li>
          <li>Cloud Platforms (GCP, AWS)</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-4xl font-bold text-[var(--color-primary-default)] mb-8 text-center">Featured Projects</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {#each featuredProjects as project}
        <div class="bg-[var(--color-neutral-50)] p-6 rounded-lg shadow-md">
          <h3 class="text-2xl font-semibold text-[var(--color-primary-default)] mb-2">{project.name}</h3>
          <p class="text-[var(--color-neutral-700)] mb-4">{project.description}</p>
          <a href={project.link} target="_blank" class="text-[var(--color-primary-accent)] hover:underline font-medium">Learn More &rarr;</a>
        </div>
      {/each}
    </div>
  </div>
</section>