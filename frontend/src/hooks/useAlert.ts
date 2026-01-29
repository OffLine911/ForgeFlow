import { useDialogStore, alert } from '@/stores/dialogStore';

export function useAlert() {
  const showAlert = useDialogStore((state) => state.alert);
  
  return {
    alert: showAlert,
    success: (title: string, message: string) => 
      showAlert({ title, message, type: 'success' }),
    error: (title: string, message: string) => 
      showAlert({ title, message, type: 'error' }),
    warning: (title: string, message: string) => 
      showAlert({ title, message, type: 'warning' }),
    info: (title: string, message: string) => 
      showAlert({ title, message, type: 'info' }),
  };
}

export { alert };
