import { useDialogStore, toast } from '@/stores/dialogStore';

export function useToast() {
  const { addToast, removeToast, clearToasts, toasts } = useDialogStore();

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    custom: toast.custom,
  };
}

export { toast };
