import React from 'react';
import styles from './ConfirmModal.module.css'; // Te paso CSS abajo

export default function ConfirmModal({ open, onCancel, onConfirm, title, message }) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title || 'Confirmar acción'}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>Cancelar</button>
          <button className={styles.accept} onClick={onConfirm}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}
