<script lang="ts">
  import { onMount } from 'svelte';

  let ip = '';
  let loading = true;
  let error = '';
  let copied = false;

  async function fetchIp() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/ip');
      if (!res.ok) throw new Error('Failed to fetch IP');
      const data = await res.json();
      ip = data.ip;
    } catch (e) {
      error = 'Could not retrieve your IP address. Please try again.';
    } finally {
      loading = false;
    }
  }

  async function copyIp() {
    try {
      await navigator.clipboard.writeText(ip);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      error = 'Failed to copy to clipboard.';
    }
  }

  onMount(fetchIp);
</script>

<svelte:head>
  <title>My IP Address - Check Your Public IP</title>
  <meta
    name="description"
    content="Quickly check your public IP address with no ads or tracking."
  />
</svelte:head>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-4xl mx-auto px-4">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-[var(--color-primary-default)] mb-4">
        My IP Address
      </h1>
      <p class="text-lg text-[var(--color-neutral-600)] max-w-2xl mx-auto">
        Quickly check your public IP address. No ads, no tracking, just your IP.
      </p>
    </div>

    <!-- IP Display Card -->
    <div
      class="bg-[var(--color-neutral-50)] rounded-lg shadow-md p-8 mb-8 text-center"
    >
      {#if loading}
        <div class="flex items-center justify-center space-x-3 py-4">
          <div
            class="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary-default)]"
          ></div>
          <span class="text-[var(--color-neutral-600)]"
            >Detecting your IP...</span
          >
        </div>
      {:else if error}
        <div class="py-4">
          <p class="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            class="bg-[var(--color-primary-default)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-primary-600)] transition-colors duration-300"
            on:click={fetchIp}
          >
            Try Again
          </button>
        </div>
      {:else}
        <p
          class="text-4xl md:text-5xl font-mono font-bold text-[var(--color-neutral-800)] mb-6 select-all"
        >
          {ip}
        </p>
        <div class="flex justify-center space-x-4">
          <button
            type="button"
            class="bg-[var(--color-primary-default)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-primary-600)] transition-colors duration-300 flex items-center space-x-2"
            on:click={copyIp}
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>
          <button
            type="button"
            class="bg-[var(--color-neutral-500)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-neutral-600)] transition-colors duration-300 flex items-center space-x-2"
            on:click={fetchIp}
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      {/if}
    </div>

    <!-- How it works -->
    <div class="mt-16 bg-[var(--color-neutral-50)] rounded-lg p-8">
      <h2
        class="text-2xl font-bold text-[var(--color-neutral-800)] mb-6 text-center"
      >
        How It Works
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div class="space-y-3">
          <div class="text-4xl">🌐</div>
          <h3 class="font-semibold text-[var(--color-neutral-800)]">
            Request
          </h3>
          <p class="text-sm text-[var(--color-neutral-600)]">
            Your browser sends a request to our server
          </p>
        </div>
        <div class="space-y-3">
          <div class="text-4xl">🔍</div>
          <h3 class="font-semibold text-[var(--color-neutral-800)]">
            Detect
          </h3>
          <p class="text-sm text-[var(--color-neutral-600)]">
            The server identifies your public IP address
          </p>
        </div>
        <div class="space-y-3">
          <div class="text-4xl">📋</div>
          <h3 class="font-semibold text-[var(--color-neutral-800)]">
            Display
          </h3>
          <p class="text-sm text-[var(--color-neutral-600)]">
            Your IP is shown instantly with one-click copy
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
