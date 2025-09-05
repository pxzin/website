<!-- Backup Section Component -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import {
    exportBackup,
    importBackup,
    refreshProjections,
    debugData,
  } from '$lib/helpers/financeActions';

  export let data: any;

  let showDebugData = false;

  async function handleExportBackup() {
    await exportBackup();
  }

  async function handleImportBackup() {
    await importBackup();
  }

  function handleToggleDebugData() {
    showDebugData = !showDebugData;
  }

  async function handleRefreshProjections() {
    await refreshProjections();
  }

  async function handleDebugData() {
    await debugData();
  }
</script>

<!-- Backup Section -->
<div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
  <h3 class="text-lg font-semibold text-gray-900 mb-4">⚙️ Data Management</h3>

  <div class="grid md:grid-cols-2 gap-6">
    <!-- Export Backup -->
    <div>
      <h4 class="font-semibold mb-2">📤 Export Backup</h4>
      <p class="text-sm text-gray-600 mb-3">
        Download all your data as a JSON file for backup or transfer.
      </p>
      <button
        on:click={handleExportBackup}
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Export Data
      </button>
    </div>

    <!-- Import Backup -->
    <div>
      <h4 class="font-semibold mb-2">📥 Import Backup</h4>
      <p class="text-sm text-gray-600 mb-3">
        Upload a JSON file to restore your data. This will replace all current
        data.
      </p>
      <div class="flex items-center gap-2">
        <button
          on:click={handleImportBackup}
          class="block w-full text-sm bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
        >
          Import Data
        </button>
      </div>
    </div>
  </div>

  <!-- Utility Buttons -->
  <div class="mt-6 flex flex-wrap gap-2">
    <button
      on:click={handleRefreshProjections}
      class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
    >
      🔄 Refresh Projections
    </button>

    <button
      on:click={handleToggleDebugData}
      class="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
    >
      {showDebugData ? '🙈 Hide Debug' : '🔍 Show Debug'}
    </button>

    {#if showDebugData}
      <button
        on:click={handleDebugData}
        class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700"
      >
        📊 Debug Data
      </button>
    {/if}
  </div>

  <!-- Debug Data Display -->
  {#if showDebugData}
    <div class="mt-6 bg-white border border-gray-200 rounded-lg p-4">
      <h4 class="font-semibold mb-2">🐛 Debug Information</h4>
      <div class="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <strong>Accounts:</strong>
          {data.accounts?.length || 0}
        </div>
        <div>
          <strong>Categories:</strong>
          {data.categories?.length || 0}
        </div>
        <div>
          <strong>Transactions:</strong>
          {data.transactions?.length || 0}
        </div>
      </div>
    </div>
  {/if}
</div>
