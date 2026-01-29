import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';
import AlertDialog from './AlertDialog';
import ContextMenu from './ContextMenu';
import ToastContainer from './Toast';

export default function DialogProvider() {
  return (
    <>
      <Dialog />
      <ConfirmDialog />
      <AlertDialog />
      <ContextMenu />
      <ToastContainer />
    </>
  );
}
