import React from 'react';
import styles from './CinnamiLoader.module.css';
import logoCinnami from '../../assets/logos/CINNAMILOGO.png';

// CinnamiLoader component
export default function CinnamiLoader({ text = "Cargando..." }) {
  return (
    <div className={styles.container}>
      <div className={styles.cargando}>
        <div className={styles.pelotasWrapper}>
          <span className={styles.pelota}>
            <img src={logoCinnami} alt="Logo de CINNAMI" />
          </span>
          <span className={styles.pelota}>
            <img src={logoCinnami} alt="Logo de CINNAMI" />
          </span>
          <span className={styles.pelota}>
            <img src={logoCinnami} alt="Logo de CINNAMI" />
          </span>
        </div>
        <p>{text}</p>
      </div>
    </div>
  );
}
