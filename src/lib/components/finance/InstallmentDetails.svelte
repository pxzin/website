<script lang="ts">
  export let transaction: any;
  export let categoryType: 'INCOME' | 'EXPENSE';

  function getInstallmentValues(transaction: any) {
    if (!transaction.installments_total) return null;

    const totalAmount = Math.abs(transaction.amount);
    const installmentValue = totalAmount / transaction.installments_total;
    const paidInstallments = transaction.installments_paid || 0;
    const remainingInstallments =
      transaction.installments_total - paidInstallments;

    const totalPaid = installmentValue * paidInstallments;
    const totalRemaining = installmentValue * remainingInstallments;

    return {
      installmentValue,
      totalPaid,
      totalRemaining,
      paidInstallments,
      remainingInstallments,
      totalInstallments: transaction.installments_total,
      isComplete: paidInstallments >= transaction.installments_total,
    };
  }

  $: installmentValues = getInstallmentValues(transaction);
</script>

{#if installmentValues}
  <div class="text-xs space-y-1 mt-1 bg-gray-50 p-2 rounded border">
    <!-- Installment progress bar -->
    <div class="flex items-center gap-2 mb-2">
      <div class="flex-1 bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all duration-300"
          class:bg-blue-500={!installmentValues.isComplete}
          class:bg-green-500={installmentValues.isComplete}
          style="width: {(installmentValues.paidInstallments /
            installmentValues.totalInstallments) *
            100}%"
        ></div>
      </div>
      <span class="text-xs text-gray-600 font-medium">
        {installmentValues.paidInstallments}/{installmentValues.totalInstallments}
      </span>
    </div>

    <!-- Installment details grid -->
    <div class="grid grid-cols-2 gap-1 text-gray-600">
      <div class="text-left">
        <div class="text-gray-500">Valor/parcela:</div>
        <div class="font-medium">
          {#if categoryType === 'EXPENSE'}
            ${installmentValues.installmentValue.toFixed(2)}
          {:else}
            +${installmentValues.installmentValue.toFixed(2)}
          {/if}
        </div>
      </div>

      <div class="text-right">
        <div class="text-gray-500">Já pago:</div>
        <div class="font-medium text-green-600">
          ${installmentValues.totalPaid.toFixed(2)}
        </div>
      </div>

      <div class="text-left">
        <div class="text-gray-500">Restante:</div>
        <div class="font-medium text-orange-600">
          ${installmentValues.totalRemaining.toFixed(2)}
        </div>
      </div>

      <div class="text-right">
        <div class="text-gray-500">Status:</div>
        {#if installmentValues.isComplete}
          <div class="text-green-600 font-medium text-xs">✅ Quitado</div>
        {:else}
          <div class="text-orange-600 font-medium text-xs">
            🔄 {installmentValues.remainingInstallments} restantes
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
