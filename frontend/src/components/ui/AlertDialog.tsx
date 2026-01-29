import { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDialogStore } from '@/stores/dialogStore';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
  },
  error: {
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    buttonBg: 'bg-red-600 hover:bg-red-500',
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    buttonBg: 'bg-amber-600 hover:bg-amber-500',
  },
  info: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    buttonBg: 'bg-blue-600 hover:bg-blue-500',
  },
};

export default function AlertDialog() {
  const { alertOpen, alertOptions, closeAlert } = useDialogStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && alertOpen) {
        closeAlert();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [alertOpen, closeAlert]);

  useEffect(() => {
    if (alertOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => buttonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [alertOpen]);

  if (!alertOpen || !alertOptions) return null;

  const { title, message, type = 'info', buttonText = 'OK' } = alertOptions;
  const Icon = icons[type];
  const style = styles[type];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      closeAlert();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className={cn(
            'w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center',
            style.iconBg
          )}>
            <Icon className={cn('w-7 h-7', style.iconColor)} />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message}</p>
        </div>

        <div className="p-4 pt-0">
          <button
            ref={buttonRef}
            onClick={closeAlert}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors',
              style.buttonBg
            )}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
