import { memo } from 'react';
import Modal from './Modal';
export default memo(function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirmer', variant = 'danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className={`btn btn-${variant}`} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{message}</p>
    </Modal>
  );
});
