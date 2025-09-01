<script>
  import { page } from '$app/stores';

  // Reactive variable to determine active link class
  $: isActiveHome = $page.url.pathname === '/';
  $: isActiveAbout = $page.url.pathname === '/about';
  $: isActiveProjects = $page.url.pathname === '/projects';
  $: isActiveContact = $page.url.pathname === '/contact';
</script>

<nav class="bg-[var(--color-primary-default)] p-4 shadow-lg fixed top-0 left-0 w-full z-50">
  <div class="container mx-auto flex justify-between items-center">
    <a href="/" class="text-white text-2xl font-bold hover:text-[var(--color-primary-accent)] transition-colors duration-300">
      Ricardo José
    </a>
    <ul class="flex space-x-6">
      <li><a href="/" class="text-white text-lg hover:text-[var(--color-primary-accent)] transition-colors duration-300" class:font-semibold={isActiveHome}>Home</a></li>
      <li><a href="/about" class="text-white text-lg hover:text-[var(--color-primary-accent)] transition-colors duration-300" class:font-semibold={isActiveAbout}>About</a></li>
      <li><a href="/projects" class="text-white text-lg hover:text-[var(--color-primary-accent)] transition-colors duration-300" class:font-semibold={isActiveProjects}>Projects</a></li>
      <li><a href="/contact" class="text-white text-lg hover:text-[var(--color-primary-accent)] transition-colors duration-300" class:font-semibold={isActiveContact}>Contact</a></li>
    </ul>
  </div>
</nav>
