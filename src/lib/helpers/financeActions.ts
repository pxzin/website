/**
 * Finance Action Functions
 * Extracted from +page.svelte for better organization
 */

import { invalidateAll } from '$app/navigation';
import {
  showError,
  showSuccess,
  showInfo,
  showWarning,
} from '$lib/stores/toast';

/**
 * Refresh projections data
 */
export async function refreshProjections(): Promise<void> {
  try {
    const formData = new FormData();
    const response = await fetch('?/refreshProjections', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      showSuccess('Projections refreshed successfully!');
      await invalidateAll();
    } else {
      showError('Failed to refresh projections');
    }
  } catch (error) {
    console.error('Error refreshing projections:', error);
    showError('Failed to refresh projections');
  }
}

/**
 * Debug data function for development
 */
export async function debugData(): Promise<void> {
  try {
    const formData = new FormData();
    const response = await fetch('?/debugData', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      if (result.type === 'success') {
        showInfo(result.data.message);
      } else {
        showError('Failed to debug data');
      }
    } else {
      showError('Failed to debug data');
    }
  } catch (error) {
    console.error('Error debugging data:', error);
    showError('Failed to debug data');
  }
}

/**
 * Export backup functionality
 */
export async function exportBackup(): Promise<void> {
  try {
    showInfo('Creating backup...');

    const response = await fetch('/tools/finance/backup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'export' }),
    });

    if (response.ok) {
      const result = await response.json();

      // Create and download the backup file
      const blob = new Blob([result.backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Backup exported successfully!');
    } else {
      const result = await response.json();
      showError(result?.error || 'Failed to export backup');
    }
  } catch (error) {
    showError('Failed to export backup');
    console.error(error);
  }
}

/**
 * Import backup functionality
 */
export async function importBackup(): Promise<void> {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // First, preview the backup content
        const fileText = await file.text();
        let backup;

        try {
          backup = JSON.parse(fileText);
        } catch (parseError) {
          showError('Invalid JSON file. Please select a valid backup file.');
          return;
        }

        // Validate and show preview
        if (
          !backup.data ||
          !backup.data.accounts ||
          !backup.data.categories ||
          !backup.data.transactions
        ) {
          showError(
            "Invalid backup file structure. This doesn't appear to be a valid backup file."
          );
          return;
        }

        const previewMessage = `📊 Backup Preview:
• Created: ${
          backup.timestamp
            ? new Date(backup.timestamp).toLocaleDateString()
            : 'Unknown'
        }
• Version: ${backup.version || 'Unknown'}
• Accounts: ${backup.data.accounts.length}
• Categories: ${backup.data.categories.length}
• Transactions: ${backup.data.transactions.length}

⚠️ This will REPLACE ALL existing data!`;

        const confirmed = confirm(
          previewMessage + '\n\nDo you want to continue?'
        );
        if (!confirmed) return;

        const doubleConfirm = prompt(
          '⚠️ FINAL WARNING: Type "RESTORE BACKUP" to confirm complete data replacement:'
        );
        if (doubleConfirm !== 'RESTORE BACKUP') {
          showInfo('Operation cancelled - confirmation text did not match');
          return;
        }

        showWarning('Importing backup and clearing existing data...');

        const formData = new FormData();
        formData.append('backupFile', file);

        const response = await fetch('/tools/finance?/importBackup', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          showSuccess(result.message || 'Backup imported successfully!');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          const result = await response.json();
          showError(result?.error || 'Failed to import backup');
        }
      } catch (error) {
        showError('Failed to process backup file');
        console.error(error);
      }
    };

    input.click();
  } catch (error) {
    showError('Failed to open file dialog');
    console.error(error);
  }
}

/**
 * Helper function for delete transaction enhance
 */
export function createDeleteTransactionEnhance() {
  return ({ formData }: any) => {
    return async ({ result }: any) => {
      if (result.type === 'failure') {
        showError(result.data?.error || 'Failed to delete transaction');
      } else if (result.type === 'success') {
        showSuccess('Transaction deleted successfully');
        await invalidateAll();
      }
    };
  };
}
