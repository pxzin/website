import { writable } from 'svelte/store';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

// Store for managing toasts
export const toasts = writable<ToastData[]>([]);

// Function to add a new toast
export function addToast(toast: Omit<ToastData, 'id'>) {
  const id = crypto.randomUUID();
  const newToast: ToastData = {
    id,
    duration: 5000, // default 5 seconds
    ...toast,
  };

  toasts.update((currentToasts) => [...currentToasts, newToast]);

  return id;
}

// Function to remove a toast
export function removeToast(id: string) {
  toasts.update((currentToasts) =>
    currentToasts.filter((toast) => toast.id !== id)
  );
}

// Convenience functions for different toast types
export function showSuccess(
  message: string,
  title?: string,
  duration?: number
) {
  return addToast({ type: 'success', message, title, duration });
}

export function showError(message: string, title?: string, duration?: number) {
  return addToast({ type: 'error', message, title, duration });
}

export function showWarning(
  message: string,
  title?: string,
  duration?: number
) {
  return addToast({ type: 'warning', message, title, duration });
}

export function showInfo(message: string, title?: string, duration?: number) {
  return addToast({ type: 'info', message, title, duration });
}

// Clear all toasts
export function clearAllToasts() {
  toasts.set([]);
}
