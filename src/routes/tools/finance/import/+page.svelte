<script lang="ts">
  import { goto } from '$app/navigation';
  import { showSuccess, showError } from '$lib/stores/toast';
  import CategoryForm from '$lib/components/finance/CategoryForm.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let csvFile: FileList | null = null;
  let selectedAccount = '';
  let importType: 'bank_statement' | 'credit_card_bill' = 'bank_statement';
  let parsedData: ImportTransaction[] = [];
  let showPreview = false;
  let uploading = false;

  // Category creation using CategoryForm component
  let showCategoryForm = false;
  let currentTransactionIndex: number | null = null;

  // Local categories list (updated when new categories are created)
  let categories = data.categories;

  interface ImportTransaction {
    date: string;
    title: string;
    amount: number;
    selected: boolean;
    category_id: string;
    is_recurrent: boolean;
    installments_total: number | null;
    installments_paid: number | null;
    installment_start_date: string | null;
    type: 'income' | 'expense';
  }

  // Check if transaction looks like an installment based on title pattern
  function detectInstallment(title: string) {
    const installmentRegex = /(\d+)\/(\d+)/;
    const match = title.match(installmentRegex);

    if (match) {
      const paid = parseInt(match[1]);
      const total = parseInt(match[2]);
      return {
        is_installment: true,
        installments_paid: paid,
        installments_total: total,
      };
    }

    return {
      is_installment: false,
      installments_paid: null,
      installments_total: null,
    };
  }

  function openCategoryForm(transactionIndex: number) {
    currentTransactionIndex = transactionIndex;
    showCategoryForm = true;
  }

  // Handle category creation from CategoryForm
  function handleCategoryCreated(event: CustomEvent) {
    const newCategory = event.detail.category;

    // Add the new category to our local list
    categories = [...categories, newCategory];

    // If we have a current transaction index, assign this category to it
    if (currentTransactionIndex !== null) {
      parsedData[currentTransactionIndex].category_id = newCategory.id;
      currentTransactionIndex = null;
    }

    showSuccess(`Categoria "${newCategory.name}" criada com sucesso!`);
  }

  async function parseCSV() {
    if (!csvFile || csvFile.length === 0) {
      showError('Selecione um arquivo CSV');
      return;
    }

    if (!selectedAccount) {
      showError('Selecione uma conta');
      return;
    }

    uploading = true;

    try {
      const text = await csvFile[0].text();
      const lines = text.trim().split('\n');

      if (lines.length < 2) {
        showError('Arquivo CSV deve ter pelo menos uma linha de dados');
        return;
      }

      // Skip header line and parse data
      const dataLines = lines.slice(1);
      parsedData = dataLines.map((line) => {
        const [date, title, amountStr] = line.split(',');
        const amount = parseFloat(amountStr);
        const installmentInfo = detectInstallment(title);

        // Determine transaction type based on import type and amount
        let transactionType: 'income' | 'expense';
        if (importType === 'credit_card_bill') {
          // For credit card bills: positive = expense, negative = credit/payment
          transactionType = amount > 0 ? 'expense' : 'income';
        } else {
          // For bank statements: positive = income, negative = expense
          transactionType = amount >= 0 ? 'income' : 'expense';
        }

        return {
          date: date.trim(),
          title: title.trim(),
          amount,
          selected: true, // Default to selected
          category_id: '', // User will select
          is_recurrent: false,
          installments_total: installmentInfo.installments_total,
          installments_paid: installmentInfo.installments_paid,
          installment_start_date: installmentInfo.is_installment
            ? date.trim()
            : null,
          type: transactionType,
        } satisfies ImportTransaction;
      });

      showPreview = true;
      showSuccess(`${parsedData.length} transações carregadas para revisão`);
    } catch (error) {
      showError('Erro ao processar arquivo CSV');
      console.error(error);
    } finally {
      uploading = false;
    }
  }

  function toggleAll() {
    const allSelected = parsedData.every((t) => t.selected);

    if (allSelected) {
      // Se todos estão selecionados, desmarca todos
      parsedData = parsedData.map((t) => ({ ...t, selected: false }));
    } else {
      // Se nem todos estão selecionados, marca todos
      parsedData = parsedData.map((t) => ({ ...t, selected: true }));
    }
  }

  async function importTransactions() {
    const selectedTransactions = parsedData.filter((t) => t.selected);

    if (selectedTransactions.length === 0) {
      showError('Selecione pelo menos uma transação para importar');
      return;
    }

    const invalidTransactions = selectedTransactions.filter(
      (t) => !t.category_id
    );
    if (invalidTransactions.length > 0) {
      showError('Todas as transações selecionadas devem ter uma categoria');
      return;
    }

    uploading = true;

    try {
      const formData = new FormData();
      formData.append('account_id', selectedAccount);
      formData.append('import_type', importType);
      formData.append('transactions', JSON.stringify(selectedTransactions));

      const response = await fetch('?/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.type === 'success') {
        showSuccess(
          `${selectedTransactions.length} transações importadas com sucesso!`
        );
        goto('/tools/finance');
      } else {
        showError(result.data?.message || 'Erro ao importar transações');
      }
    } catch (error) {
      showError('Erro ao importar transações');
      console.error(error);
    } finally {
      uploading = false;
    }
  }

  $: selectedCount = parsedData.filter((t) => t.selected).length;

  // Recalculate transaction types when import type changes
  $: if (parsedData.length > 0 && importType) {
    parsedData = parsedData.map((transaction) => {
      let transactionType: 'income' | 'expense';
      if (importType === 'credit_card_bill') {
        // For credit card bills: positive = expense, negative = credit/payment
        transactionType = transaction.amount > 0 ? 'expense' : 'income';
      } else {
        // For bank statements: positive = income, negative = expense
        transactionType = transaction.amount >= 0 ? 'income' : 'expense';
      }

      return {
        ...transaction,
        type: transactionType,
      };
    });
  }
</script>

<svelte:head>
  <title>Importar CSV - Fintrack</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Importar Transações CSV
          </h1>
          <p class="mt-2 text-gray-600">
            Importe transações do Nubank ou outros bancos via arquivo CSV
          </p>
        </div>
        <a
          href="/tools/finance"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Voltar
        </a>
      </div>
    </div>

    {#if !showPreview}
      <!-- File Upload Section -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          1. Selecione o arquivo CSV
        </h2>

        <div class="space-y-4">
          <div>
            <label
              for="csv-file"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Arquivo CSV
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              bind:files={csvFile}
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p class="mt-1 text-xs text-gray-500">
              Formato esperado: date,title,amount (primeira linha será ignorada
              como cabeçalho)
            </p>
          </div>

          <div>
            <label
              for="account"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Conta de destino
            </label>
            <select
              id="account"
              bind:value={selectedAccount}
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione uma conta</option>
              {#each data.accounts as account}
                <option value={account.id}
                  >{account.name} ({account.type})</option
                >
              {/each}
            </select>
          </div>

          <div>
            <label
              for="import-type"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Tipo de arquivo
            </label>
            <select
              id="import-type"
              bind:value={importType}
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="bank_statement"
                >Extrato bancário (valores positivos = receitas)</option
              >
              <option value="credit_card_bill"
                >Fatura de cartão de crédito (valores positivos = gastos)</option
              >
            </select>
            <p class="mt-1 text-xs text-gray-500">
              {#if importType === 'credit_card_bill'}
                ⚠️ Para faturas de cartão: valores positivos serão importados
                como despesas
              {:else}
                ℹ️ Para extratos bancários: valores positivos serão importados
                como receitas
              {/if}
            </p>
          </div>

          <button
            type="button"
            disabled={!csvFile || !selectedAccount || uploading}
            on:click={parseCSV}
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {#if uploading}
              <svg
                class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processando...
            {:else}
              Analisar Arquivo
            {/if}
          </button>
        </div>
      </div>
    {:else}
      <!-- Preview Section -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">
            2. Revisar Transações ({selectedCount}/{parsedData.length} selecionadas)
          </h2>
          <div class="flex space-x-2">
            <button
              type="button"
              on:click={toggleAll}
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              {parsedData.every((t) => t.selected)
                ? 'Desmarcar todas'
                : 'Marcar todas'}
            </button>
            <button
              type="button"
              on:click={() => {
                showPreview = false;
                parsedData = [];
              }}
              class="text-sm text-gray-600 hover:text-gray-800"
            >
              Voltar ao upload
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Importar
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Descrição
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Valor
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Categoria
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Parcelas
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Recorrente
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each parsedData as transaction, index}
                <tr
                  class="hover:bg-gray-50"
                  class:opacity-50={!transaction.selected}
                >
                  <td class="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      bind:checked={transaction.selected}
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td class="px-3 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {transaction.title}
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex flex-col">
                      <span
                        class={transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'}
                      >
                        R$ {Math.abs(transaction.amount).toFixed(2)}
                      </span>
                      <span class="text-xs text-gray-500">
                        {transaction.type === 'income'
                          ? '📈 Receita'
                          : '📉 Despesa'}
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <select
                        bind:value={transaction.category_id}
                        disabled={!transaction.selected}
                        class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 flex-1"
                      >
                        <option value="">Selecionar categoria</option>
                        {#each categories as category}
                          <option value={category.id}>
                            {category.icon || '📁'}
                            {category.name}
                          </option>
                        {/each}
                      </select>
                      <button
                        type="button"
                        disabled={!transaction.selected}
                        on:click={() => openCategoryForm(index)}
                        class="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title="Criar nova categoria"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {#if transaction.installments_total}
                      <span
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {transaction.installments_paid}/{transaction.installments_total}
                      </span>
                    {:else}
                      <input
                        type="checkbox"
                        bind:checked={transaction.is_recurrent}
                        disabled={!transaction.selected}
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
                      />
                    {/if}
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {#if !transaction.installments_total}
                      <input
                        type="checkbox"
                        bind:checked={transaction.is_recurrent}
                        disabled={!transaction.selected}
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
                      />
                    {:else}
                      <span class="text-gray-400">-</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        {#if selectedCount > 0}
          <div class="mt-6 flex justify-end">
            <button
              type="button"
              disabled={uploading}
              on:click={importTransactions}
              class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {#if uploading}
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Importando...
              {:else}
                Importar {selectedCount} Transaç{selectedCount === 1
                  ? 'ão'
                  : 'ões'}
              {/if}
            </button>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Info Box -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Dicas de importação</h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc list-inside space-y-1">
              <li>
                Transações com padrão "N/N" serão automaticamente identificadas
                como parceladas
              </li>
              <li>
                <strong>Extrato bancário:</strong> valores positivos = receitas,
                valores negativos = despesas
              </li>
              <li>
                <strong>Fatura de cartão:</strong> valores positivos = despesas,
                valores negativos = pagamentos/estornos
              </li>
              <li>
                Certifique-se de selecionar o tipo correto antes de analisar o
                arquivo
              </li>
              <li>Revise cada transação e selecione a categoria apropriada</li>
              <li>
                <strong>💡 Novo:</strong> Clique no botão "+" para criar novas categorias
                sem sair da importação
              </li>
              <li>
                Transações parceladas não podem ser marcadas como recorrentes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Category Form -->
<CategoryForm
  {categories}
  bind:showForm={showCategoryForm}
  hideListSection={true}
  actionName="createCategory"
  on:categoryCreated={handleCategoryCreated}
/>
