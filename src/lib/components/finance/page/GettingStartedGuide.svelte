<!-- Getting Started Guide Component -->
<script lang="ts">
  export let accounts: any[] = [];
  export let categories: any[] = [];
</script>

<!-- Getting Started Guide -->
{#if accounts.length === 0 && categories.length === 0}
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
    <div class="text-center">
      <div class="text-4xl mb-4">🚀</div>
      <h3 class="text-xl font-semibold text-blue-900 mb-3">
        Welcome to Your Financial Tool!
      </h3>
      <p class="text-blue-700 mb-4">
        Get started by setting up your accounts and categories:
      </p>
      <div class="grid md:grid-cols-3 gap-4 text-sm">
        <div class="bg-white p-4 rounded-lg border border-blue-200">
          <div class="text-2xl mb-2">🏦</div>
          <h4 class="font-semibold mb-1">1. Add Accounts</h4>
          <p class="text-gray-600">
            Create accounts for your bank, credit cards, and cash.
          </p>
        </div>
        <div class="bg-white p-4 rounded-lg border border-blue-200">
          <div class="text-2xl mb-2">📂</div>
          <h4 class="font-semibold mb-1">2. Create Categories</h4>
          <p class="text-gray-600">
            Organize your income and expenses into categories.
          </p>
        </div>
        <div class="bg-white p-4 rounded-lg border border-blue-200">
          <div class="text-2xl mb-2">💸</div>
          <h4 class="font-semibold mb-1">3. Add Transactions</h4>
          <p class="text-gray-600">
            Track your financial movements and see projections.
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}
