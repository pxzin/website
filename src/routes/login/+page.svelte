<script lang="ts">
	import { enhance } from '$app/forms';
	export let form;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
		<h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Protected Area</h1>
		<form method="POST" action="?/login" use:enhance>
			<div class="mb-4">
				<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
				<input
					type="password"
					name="password"
					id="password"
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-accent focus:border-primary-accent"
					required
				/>
			</div>

			{#if form?.error}
				<p class="text-red-500 text-sm mb-4">{form.error}</p>
			{/if}

			<button
				type="submit"
				class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-default hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-accent"
			>
				Login
			</button>
		</form>
	</div>
</div>
