<script lang="ts">
  import { marked } from 'marked';

  export let data;

  let renderedChangelog: string;

  $: {
    renderedChangelog = marked(data.changelogContent) as string;
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Changelog</h1>
  <div class="prose lg:prose-xl" >
    {@html renderedChangelog}
  </div>
</div>

<style lang="postcss">
  /* Add any specific styles for the changelog page here */
</style>
