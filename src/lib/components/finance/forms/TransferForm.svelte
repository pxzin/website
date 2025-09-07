<!-- Transfer Form Component -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Account } from '$lib/server/turso';

  export let accounts: Account[];
  export let onClose: () => void;

  let fromAccountId = '';
  let toAccountId = '';
  let amount = '';
  let description = '';

  $: isValid =
    fromAccountId && toAccountId && amount && fromAccountId !== toAccountId;

  function handleSubmit() {
    if (!isValid) return;

    // This will be handled by the enhanced form submission
    return async ({ result }: any) => {
      if (result.type === 'success') {
        onClose();
        // Reset form
        fromAccountId = '';
        toAccountId = '';
        amount = '';
        description = '';
      }
    };
  }
</script>

<div
  class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
>
  <div class="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div class="flex justify-between items-center p-6 border-b">
      <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <span>🔄</span>
        Transferência entre Contas
      </h2>
      <button
        type="button"
        on:click={onClose}
        class="text-gray-400 hover:text-gray-600"
      >
        <span class="sr-only">Fechar</span>
        <svg
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Form -->
    <form
      method="POST"
      action="?/transfer"
      use:enhance={handleSubmit}
      class="p-6 space-y-4"
    >
      <!-- From Account -->
      <div>
        <label
          for="fromAccount"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Conta de Origem
        </label>
        <select
          id="fromAccount"
          name="fromAccountId"
          bind:value={fromAccountId}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione a conta de origem</option>
          {#each accounts as account}
            <option value={account.id}>{account.name}</option>
          {/each}
        </select>
      </div>

      <!-- To Account -->
      <div>
        <label
          for="toAccount"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Conta de Destino
        </label>
        <select
          id="toAccount"
          name="toAccountId"
          bind:value={toAccountId}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione a conta de destino</option>
          {#each accounts as account}
            {#if account.id !== fromAccountId}
              <option value={account.id}>{account.name}</option>
            {/if}
          {/each}
        </select>
      </div>

      <!-- Amount -->
      <div>
        <label
          for="amount"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Valor
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          bind:value={amount}
          step="0.01"
          min="0.01"
          placeholder="0.00"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Description -->
      <div>
        <label
          for="description"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Descrição (opcional)
        </label>
        <input
          type="text"
          id="description"
          name="description"
          bind:value={description}
          placeholder="Ex: Pagamento cartão de crédito"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          on:click={onClose}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isValid}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
        >
          Transferir
        </button>
      </div>
    </form>
  </div>
</div>
