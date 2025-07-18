import React, { useState, useEffect } from 'react';
import styles from './DoorStatusScreen.module.css';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
// Componente para el estado de la puerta
const DoorStatusScreen = () => {
  const [puertaAbierta, setPuertaAbierta] = useState(false);
  const [timerPuerta, setTimerPuerta] = useState(null);

  const abrirPuerta = () => {
    if (!puertaAbierta) {
      setPuertaAbierta(true);
      const timer = setTimeout(() => {
        cerrarPuerta();
      }, 5000);
      setTimerPuerta(timer);
    } else {
      cerrarPuerta();
    }
  };

  const cerrarPuerta = () => {
    setPuertaAbierta(false);
    if (timerPuerta) {
      clearTimeout(timerPuerta);
      setTimerPuerta(null);
    }
  };

  useEffect(() => {
    return () => {
      if (timerPuerta) {
        clearTimeout(timerPuerta);
      }
    };
  }, [timerPuerta]);

  return (
    <div className={styles.containerPrincipal}>
      <section className={styles.seccionPrincipal}>
        <NavigationMenu userType="admin" />
        <div className={styles.contenedorPrincipal}>
          {/* Contenido principal - Control de puerta */}
          <div className={styles.contenidoPrincipal}>
            {/* Panel de control de puerta */}
            <div className={styles.panelPuerta}>
              {/* Estado actual de la puerta */}
              <div className={styles.estadoPuerta}>
                <h3 className={styles.tituloEstado}>Estado actual de la puerta</h3>
                <div className={styles.indicadorEstadoPuerta}>
                  <span
                    className={`${styles.textoEstadoPuerta} ${puertaAbierta ? styles.abierta : styles.cerrada}`}
                  >
                    {puertaAbierta ? 'ABIERTA' : 'CERRADA'}
                  </span>
                </div>
                <button
                  className={`${styles.botonAbrirPuerta} ${puertaAbierta ? styles.botonCerrar : ''}`}
                  onClick={abrirPuerta}
                >
                  {puertaAbierta ? 'Cerrar Puerta' : 'Abrir Puerta'}
                </button>
              </div>
            </div>
          </div>
          {/* Panel de notificaciones */}
          <div className={styles.panelNotificaciones}>
            <div className={styles.encabezadoNotificacion}>
              <h3 className={styles.tituloNotificacion}>Notificaciones cada 15 min</h3>
              <div className={styles.toggleNotificacion}>
                <input type="checkbox" id="toggle-notif" defaultChecked />
                <label htmlFor="toggle-notif" className={styles.sliderToggle}></label>
              </div>
            </div>
            <p className={styles.descripcionNotificacion}>
              Recibirás alertas cuando la puerta esté abierta por más de 15 minutos
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoorStatusScreen;