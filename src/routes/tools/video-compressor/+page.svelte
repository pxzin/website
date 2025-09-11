<script lang="ts">
  import { showSuccess, showError } from '$lib/stores/toast';
  import ToastContainer from '$lib/components/ToastContainer.svelte';

  let isLoading = false;
  let fileInput: HTMLInputElement;
  let selectedFileName: string | null = null;
  let isDragging = false;
  let progress = 0;
  let progressInterval: NodeJS.Timeout | undefined;
  let finalizingProgress = 0; // For the last 5%

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      fileInput.files = event.dataTransfer.files;
      selectedFileName = fileInput.files[0].name;
    }
  }

  function handleFileChange() {
    if (fileInput.files && fileInput.files.length > 0) {
      selectedFileName = fileInput.files[0].name;
    } else {
      selectedFileName = null;
    }
  }

  async function handleSubmit(event: Event) {
    isLoading = true;
    progress = 0;
    finalizingProgress = 0;
    selectedFileName = null; // Clear selected file name on submit
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Start fake progress with smoother animation
    progressInterval = setInterval(() => {
      if (progress < 85) {
        progress = Math.min(progress + Math.random() * 2 + 0.5, 85); // Random increment for more realistic feel
      } else if (progress < 95) {
        progress = Math.min(progress + 0.2, 95); // Slower progress near the end
      }
    }, 150); // Update every 150ms for smoother animation

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
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

      showSuccess('Vídeo comprimido com sucesso!', 'Sucesso');
    } catch (e: any) {
      showError(e.message, 'Erro na Compressão');
    } finally {
      isLoading = false;
      clearInterval(progressInterval);
      progress = 100; // Ensure progress bar completes
      finalizingProgress = 100; // Ensure finalizing progress completes

      // Reset progress after a short delay for visual effect
      setTimeout(() => {
        progress = 0;
        finalizingProgress = 0;
      }, 1000);
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
  <div class="container mx-auto p-8 max-w-2xl">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-4 text-gray-800">Compressor de Vídeo</h1>
      <p class="text-lg text-gray-600">
        Envie um vídeo para comprimi-lo para aproximadamente 171MB, ideal para
        WhatsApp.
      </p>
    </div>

    <form
      method="POST"
      enctype="multipart/form-data"
      action="/api/compress"
      on:submit|preventDefault={handleSubmit}
    >
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <div
          class="drop-zone"
          class:dragging={isDragging}
          role="button"
          tabindex="0"
          on:dragover={handleDragOver}
          on:dragleave={handleDragLeave}
          on:drop={handleDrop}
          on:click={() => fileInput.click()}
          on:keydown={(e) => e.key === 'Enter' && fileInput.click()}
        >
          <input
            type="file"
            id="video-upload"
            name="video"
            accept="video/*"
            class="hidden"
            bind:this={fileInput}
            on:change={handleFileChange}
            required
          />
          {#if selectedFileName}
            <div class="text-center">
              <svg
                class="w-16 h-16 mx-auto mb-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-lg font-semibold text-gray-700 mb-2">
                Arquivo selecionado:
              </p>
              <p class="text-blue-600 font-medium">{selectedFileName}</p>
              <p class="text-sm text-gray-500 mt-2">
                Clique ou arraste outro arquivo para trocar
              </p>
            </div>
          {:else}
            <div class="text-center">
              <svg
                class="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p class="text-xl font-semibold text-gray-700 mb-2">
                Arraste e solte seu vídeo aqui
              </p>
              <p class="text-gray-500 mb-2">
                ou clique para selecionar um arquivo
              </p>
              <p class="text-sm text-gray-400">
                (Formatos suportados: MP4, MOV, WebM)
              </p>
            </div>
          {/if}
        </div>

        {#if isLoading}
          <div class="mt-8">
            <div class="custom-progress">
              <div class="custom-progress-bar" style="width: {progress}%"></div>
            </div>
            <p class="text-center text-sm text-gray-600 mt-3 font-medium">
              {#if progress < 100}
                Comprimindo... {Math.round(progress)}%
              {:else}
                Finalizando...
              {/if}
            </p>
          </div>
        {/if}

        <div class="mt-8">
          <button
            type="submit"
            class="custom-button"
            disabled={isLoading || !selectedFileName}
          >
            {#if isLoading}
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Comprimindo...
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Comprimir Vídeo
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>

<ToastContainer />

<style>
  .custom-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    min-height: 60px;
  }

  .custom-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  }

  .custom-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .custom-progress {
    width: 100%;
    height: 12px;
    background: #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .custom-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    border-radius: 6px;
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .custom-progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .drop-zone {
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f9fafb;
  }

  .drop-zone:hover {
    border-color: #6366f1;
    background: #f0f9ff;
  }

  .drop-zone.dragging {
    border-color: #4f46e5;
    background: #ede9fe;
    transform: scale(1.02);
  }
</style>
