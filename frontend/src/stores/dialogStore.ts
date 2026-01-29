import { create } from 'zustand';
import type { DialogOptions, ConfirmDialogOptions, ContextMenuOptions, Toast, AlertDialogOptions } from '@/types/dialog';

interface DialogState {
  // Dialog
  dialogOpen: boolean;
  dialogOptions: DialogOptions | null;
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
  
  // Confirm Dialog
  confirmOpen: boolean;
  confirmOptions: ConfirmDialogOptions | null;
  confirmResolver: ((value: boolean) => void) | null;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  closeConfirm: (result: boolean) => void;
  
  // Context Menu
  contextMenuOpen: boolean;
  contextMenuOptions: ContextMenuOptions | null;
  openContextMenu: (options: ContextMenuOptions) => void;
  closeContextMenu: () => void;
  
  // Toast Notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Alert Dialog
  alertOpen: boolean;
  alertOptions: AlertDialogOptions | null;
  alert: (options: AlertDialogOptions) => Promise<void>;
  alertResolver: (() => void) | null;
  closeAlert: () => void;
}

export const useDialogStore = create<DialogState>()((set, get) => ({
  // Dialog
  dialogOpen: false,
  dialogOptions: null,
  openDialog: (options) => set({ dialogOpen: true, dialogOptions: options }),
  closeDialog: () => {
    set((state) => {
      state.dialogOptions?.onClose?.();
      return { dialogOpen: false, dialogOptions: null };
    });
  },
  
  // Confirm Dialog
  confirmOpen: false,
  confirmOptions: null,
  confirmResolver: null,
  confirm: (options) => {
    return new Promise((resolve) => {
      set({ 
        confirmOpen: true, 
        confirmOptions: options,
        confirmResolver: resolve 
      });
    });
  },
  closeConfirm: (result) => {
    const { confirmResolver, confirmOptions } = get();
    if (result) confirmOptions?.onConfirm?.();
    else confirmOptions?.onCancel?.();
    
    if (confirmResolver) confirmResolver(result);
    set({ confirmOpen: false, confirmOptions: null, confirmResolver: null });
  },
  
  // Context Menu
  contextMenuOpen: false,
  contextMenuOptions: null,
  openContextMenu: (options) => set({ contextMenuOpen: true, contextMenuOptions: options }),
  closeContextMenu: () => set({ contextMenuOpen: false, contextMenuOptions: null }),
  
  // Toast Notifications
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const duration = toast.duration ?? 5000;
    
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
    
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },
  clearToasts: () => set({ toasts: [] }),
  
  // Alert Dialog
  alertOpen: false,
  alertOptions: null,
  alertResolver: null,
  alert: (options) => {
    return new Promise((resolve) => {
      set({
        alertOpen: true,
        alertOptions: options,
        alertResolver: resolve
      });
    });
  },
  closeAlert: () => {
    const { alertResolver, alertOptions } = get();
    alertOptions?.onClose?.();
    if (alertResolver) alertResolver();
    set({ alertOpen: false, alertOptions: null, alertResolver: null });
  },
}));

// Helper functions for easy toast creation
export const toast = {
  success: (title: string, message?: string) => 
    useDialogStore.getState().addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) => 
    useDialogStore.getState().addToast({ type: 'error', title, message, duration: 8000 }),
  warning: (title: string, message?: string) => 
    useDialogStore.getState().addToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) => 
    useDialogStore.getState().addToast({ type: 'info', title, message }),
  custom: (options: Omit<Toast, 'id'>) => 
    useDialogStore.getState().addToast(options),
};

export const alert = (options: AlertDialogOptions) => 
  useDialogStore.getState().alert(options);
