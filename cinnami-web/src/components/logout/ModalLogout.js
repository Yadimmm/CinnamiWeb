import React from "react";
import styles from "./ModalLogout.module.css";

// MoodalLogout component
export default function ModalLogout({ visible, onCancel, onConfirm }) {
  if (!visible) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.titulo}>Cerrar sesión</h2>
        <p className={styles.mensaje}>¿Estás seguro de que quieres cerrar sesión?</p>
        <div className={styles.acciones}>
          <button onClick={onCancel} className={styles.botonCancelar}>Cancelar</button>
          <button onClick={onConfirm} className={styles.botonConfirmar}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}
