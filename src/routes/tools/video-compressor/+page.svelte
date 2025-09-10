<script lang="ts">
	let isLoading = false;
	let error: string | null = null;

	async function handleSubmit(event: Event) {
		isLoading = true;
		error = null;
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		try {
			const response = await fetch(form.action, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || 'Ocorreu um erro desconhecido.');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');

			const contentDisposition = response.headers.get('content-disposition');
			let filename = 'compressed-video.mp4';
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
				if (filenameMatch && filenameMatch.length > 1) {
					filename = filenameMatch[1];
				}
			}

			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
		} catch (e: any) {
			error = e.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto p-8">
	<h1 class="text-2xl font-bold mb-4">Compressor de Vídeo</h1>
	<p class="mb-6">Envie um vídeo para comprimi-lo para aproximadamente 171MB, ideal para WhatsApp.</p>

	<form method="POST" enctype="multipart/form-data" action="/api/compress" on:submit|preventDefault={handleSubmit}>
		<div class="bg-base-200 p-6 rounded-lg shadow-md">
			<div class="form-control w-full">
				<label class="label" for="video-upload">
					<span class="label-text">Selecione o arquivo de vídeo</span>
				</label>
				<input
					type="file"
					id="video-upload"
					name="video"
					accept="video/*"
					class="file-input file-input-bordered w-full"
					required
				/>
			</div>

			<div class="mt-6">
				<button type="submit" class="btn btn-primary w-full" disabled={isLoading}>
					{#if isLoading}
						<span class="loading loading-spinner" />
						Comprimindo...
					{:else}
						Comprimir Vídeo
					{/if}
				</button>
			</div>
		</div>
	</form>

	{#if error}
		<div class="alert alert-error mt-6">
			<div>
				<span>Erro: {error}</span>
			</div>
		</div>
	{/if}
</div>