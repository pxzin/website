<script lang="ts">
  import { onMount } from 'svelte';

  let fileInput: HTMLInputElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let originalImage: HTMLImageElement | null = null;
  let trimmedDataUrl: string | null = null;
  let trimmedDimensions: { width: number; height: number } | null = null;
  let isProcessing = false;
  let dragOver = false;

  onMount(() => {
    try {
      if (canvas) {
        ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Could not get canvas context');
        }
      }
    } catch (error) {
      console.error('Error initializing canvas:', error);
    }
  });

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    isProcessing = true;

    // Reset previous results
    originalImage = null;
    trimmedDataUrl = null;
    trimmedDimensions = null;

    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        isProcessing = false;
        alert('Error reading file');
        return;
      }

      const img = new Image();

      img.onload = () => {
        // Ensure canvas is ready
        if (!canvas || !ctx) {
          isProcessing = false;
          alert('Canvas not ready. Please try again.');
          return;
        }

        originalImage = img;
        setTimeout(() => {
          trimTransparency(img);
        }, 100); // Small delay to ensure everything is ready
      };

      img.onerror = () => {
        isProcessing = false;
        alert('Error loading image. Please try a different file.');
      };

      img.src = e.target.result as string;
    };

    reader.onerror = () => {
      isProcessing = false;
      alert('Error reading file. Please try again.');
    };

    reader.readAsDataURL(file);
  }

  function trimTransparency(img: HTMLImageElement) {
    try {
      // Verify canvas and context are available
      if (!canvas || !ctx) {
        throw new Error('Canvas not available');
      }

      // Set canvas to original image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Find bounds of non-transparent pixels
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = -1;
      let maxY = -1;

      // Scan all pixels to find the bounding box of non-transparent content
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const alpha = data[index + 3];

          // If pixel is not fully transparent (alpha > threshold)
          if (alpha > 10) {
            // Small threshold to handle anti-aliasing
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // If no non-transparent pixels found, use original dimensions
      if (maxX === -1 || maxY === -1) {
        minX = 0;
        minY = 0;
        maxX = canvas.width - 1;
        maxY = canvas.height - 1;
      }

      // Calculate trimmed dimensions
      const trimmedWidth = maxX - minX + 1;
      const trimmedHeight = maxY - minY + 1;

      // Create new canvas with trimmed dimensions
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = trimmedWidth;
      trimmedCanvas.height = trimmedHeight;
      const trimmedCtx = trimmedCanvas.getContext('2d');

      if (!trimmedCtx) {
        throw new Error('Could not create trimmed canvas context');
      }

      // Draw trimmed image
      trimmedCtx.drawImage(
        canvas,
        minX,
        minY,
        trimmedWidth,
        trimmedHeight,
        0,
        0,
        trimmedWidth,
        trimmedHeight
      );

      // Get trimmed image as data URL
      trimmedDataUrl = trimmedCanvas.toDataURL('image/png');
      trimmedDimensions = { width: trimmedWidth, height: trimmedHeight };
    } catch (error) {
      console.error('Error trimming transparency:', error);
      alert('Error processing image. Please try again.');
    } finally {
      isProcessing = false;
    }
  }

  function downloadTrimmed() {
    if (!trimmedDataUrl) return;

    const link = document.createElement('a');
    link.download = 'trimmed-image.png';
    link.href = trimmedDataUrl;
    link.click();
  }

  function reset() {
    originalImage = null;
    trimmedDataUrl = null;
    trimmedDimensions = null;
    if (fileInput) fileInput.value = '';
  }
</script>

<svelte:head>
  <title>TrimTransparency - Remove Excess Transparency</title>
  <meta
    name="description"
    content="Remove excess transparent space from images automatically"
  />
</svelte:head>

<section class="py-16 bg-white text-[var(--color-neutral-800)]">
  <div class="max-w-4xl mx-auto px-4">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-[var(--color-primary-default)] mb-4">
        TrimTransparency
      </h1>
      <p class="text-lg text-[var(--color-neutral-600)] max-w-2xl mx-auto">
        Automatically remove excess transparent space from your images. Perfect
        for logos, icons, and graphics.
      </p>
    </div>

    <!-- Upload Area -->
    <div class="mb-8">
      <div
        role="button"
        tabindex="0"
        class="border-2 border-dashed border-[var(--color-neutral-300)] rounded-lg p-8 text-center transition-colors duration-300"
        class:border-[var(--color-primary-default)]={dragOver}
        class:bg-[var(--color-primary-50)]={dragOver}
        on:drop={handleDrop}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:click={() => fileInput.click()}
        on:keydown={(e) => e.key === 'Enter' && fileInput.click()}
      >
        <div class="space-y-4">
          <div class="text-6xl">🖼️</div>
          <div>
            <p class="text-lg font-medium text-[var(--color-neutral-700)]">
              Drop an image here or click to browse
            </p>
            <p class="text-sm text-[var(--color-neutral-500)] mt-2">
              Supports PNG, JPG, GIF, WebP, and other image formats
            </p>
          </div>
          <input
            bind:this={fileInput}
            type="file"
            accept="image/*"
            on:change={handleFileSelect}
            class="hidden"
          />
          <button
            type="button"
            class="bg-[var(--color-primary-default)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-primary-600)] transition-colors duration-300"
            on:click={() => fileInput.click()}
          >
            Choose Image
          </button>
        </div>
      </div>
    </div>

    <!-- Processing Status -->
    {#if isProcessing}
      <div class="text-center mb-8">
        <div class="inline-flex items-center space-x-3">
          <div
            class="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary-default)]"
          ></div>
          <span class="text-[var(--color-neutral-600)]"
            >Processing image...</span
          >
        </div>
      </div>
    {/if}

    <!-- Results -->
    {#if originalImage && trimmedDataUrl && !isProcessing}
      <div class="space-y-8">
        <!-- Before/After Comparison -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Original -->
          <div class="space-y-4">
            <h3 class="text-xl font-semibold text-[var(--color-neutral-800)]">
              Original
            </h3>
            <div class="bg-gray-100 p-4 rounded-lg border">
              <img
                src={originalImage.src}
                alt="Original"
                class="max-w-full h-auto mx-auto"
                style="max-height: 300px;"
              />
              <p
                class="text-sm text-[var(--color-neutral-600)] mt-2 text-center"
              >
                {originalImage.width} × {originalImage.height} px
              </p>
            </div>
          </div>

          <!-- Trimmed -->
          <div class="space-y-4">
            <h3 class="text-xl font-semibold text-[var(--color-neutral-800)]">
              Trimmed
            </h3>
            <div class="bg-gray-100 p-4 rounded-lg border">
              <img
                src={trimmedDataUrl}
                alt="Trimmed"
                class="max-w-full h-auto mx-auto"
                style="max-height: 300px;"
              />
              <p
                class="text-sm text-[var(--color-neutral-600)] mt-2 text-center"
              >
                {trimmedDimensions?.width} × {trimmedDimensions?.height} px
                {#if trimmedDimensions && originalImage}
                  <br />
                  <span class="text-green-600 font-medium">
                    Reduced by {Math.round(
                      ((originalImage.width * originalImage.height -
                        trimmedDimensions.width * trimmedDimensions.height) /
                        (originalImage.width * originalImage.height)) *
                        100
                    )}%
                  </span>
                {/if}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center space-x-4">
          <button
            type="button"
            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center space-x-2"
            on:click={downloadTrimmed}
          >
            <span>📥</span>
            <span>Download Trimmed Image</span>
          </button>
          <button
            type="button"
            class="bg-[var(--color-neutral-500)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-neutral-600)] transition-colors duration-300 flex items-center space-x-2"
            on:click={reset}
          >
            <span>🔄</span>
            <span>Try Another Image</span>
          </button>
        </div>
      </div>
    {/if}

    <!-- Hidden canvas for processing -->
    <canvas bind:this={canvas} class="hidden"></canvas>

    <!-- How it works -->
    <div class="mt-16 bg-[var(--color-neutral-50)] rounded-lg p-8">
      <h2
        class="text-2xl font-bold text-[var(--color-neutral-800)] mb-6 text-center"
      >
        How It Works
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div class="space-y-3">
          <div class="text-4xl">📤</div>
          <h3 class="font-semibold text-[var(--color-neutral-800)]">
            Upload Image
          </h3>
          <p class="text-sm text-[var(--color-neutral-600)]">
            Select or drop any image with transparent areas
          </p>
        </div>
        <div class="space-y-3">
          <div class="text-4xl">✂️</div>
          <h3 class="font-semibold text-[var(--color-neutral-800)]">
            Auto Trim
          </h3>
          <p class="text-sm text-[var(--color-neutral-600)]">
            Automatically detects and removes excess transparency
          </p>
        </div>
        <div class="space-y-3">
          <div class="text-4xl">💾</div>
          <h3 class="font-semibold text-[var(--color-neutral-800)]">
            Download
          </h3>
          <p class="text-sm text-[var(--color-neutral-600)]">
            Get your optimized image with minimal transparent space
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
