import React, { useState } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import stylescardstatus from './CardStatusScreen.module.css';
import globalstyles from '../../styles/globalStyles.module.css';

export default function CardStatusScreen({ onLogoutClick }) {
  const [isCardBlocked, setIsCardBlocked] = useState(false);

  // Bloquear/desbloquear temporalmente la tarjeta
  const toggleCardBlock = () => {
    setIsCardBlocked((prev) => {
      if (!prev) {
        setTimeout(() => {
          alert('Tu tarjeta ha sido bloqueada temporalmente. Puedes desbloquearla en cualquier momento desde esta pantalla.');
        }, 300);
      } else {
        setTimeout(() => {
          alert('Tu tarjeta ha sido reactivada exitosamente.');
        }, 300);
      }
      return !prev;
    });
  };

  // Reportar pérdida y bloquear permanentemente
  const reportLoss = () => {
    const confirmed = window.confirm('¿Estás seguro de que quieres bloquear permanentemente tu tarjeta? Esta acción requerirá contactar al administrador para reactivarla.');
    if (confirmed) {
      alert('Tu solicitud de bloqueo permanente ha sido enviada. Contacta al administrador para más información.');
    }
  };

  return (
    <div className={stylescardstatus.containerPrincipal}>
      <NavigationMenu userType="docente" onLogoutClick={onLogoutClick} />
      <main className={stylescardstatus.contenedorDashboard}>
        <header className={globalstyles.header}>
          <h1 className={globalstyles.title}>Estado de mi tarjeta</h1>
        </header>
        <div className={stylescardstatus.contenedorPrincipal}>
          {/* Tarjeta principal */}
          <div className={stylescardstatus.tarjetaPrincipal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 className={stylescardstatus.tituloSeccion} style={{ marginBottom: 0 }}>Información de la Tarjeta</h2>
              <div className={stylescardstatus.estadoUsuario}>
                <div className={`${stylescardstatus.puntoEstado} ${isCardBlocked ? stylescardstatus.puntoEstadoBloqueado : ''}`}></div>
                <span className={`${stylescardstatus.textoEstado} ${isCardBlocked ? stylescardstatus.textoEstadoBloqueado : ''}`}>
                  {isCardBlocked ? 'Tarjeta Bloqueada' : 'Tarjeta Activa'}
                </span>
              </div>
            </div>
            {/* Tarjeta virtual */}
            <div className={stylescardstatus.tarjetaVirtual}>
              <div className={stylescardstatus.encabezadoTarjeta}>
                <div className={stylescardstatus.infoEmpresa}>
                  <div className={stylescardstatus.nombreEmpresa}>CINNAMI</div>
                  <div className={stylescardstatus.lemaEmpresa}>Smart solutions for a connected world</div>
                </div>
                <div className={stylescardstatus.chipTarjeta}></div>
              </div>
              <div className={stylescardstatus.infoUsuario}>
                <div className={stylescardstatus.nombreUsuario}>Juan Pérez García</div>
                <div className={stylescardstatus.codigoUsuario}>A1B2C3</div>
              </div>
              <div className={stylescardstatus.pieTarjeta}>
                <div className={stylescardstatus.validaHasta}>
                  <div></div>
                  <div></div>
                </div>
                <div className={stylescardstatus.tipoAcceso}>EMPLEADO</div>
              </div>
            </div>
            {/* Información de la tarjeta */}
            <div className={stylescardstatus.infoTarjeta}>
              <div className={stylescardstatus.campoInfo}>
                <div className={stylescardstatus.etiquetaCampo}>Número de Empleado</div>
                <div className={stylescardstatus.valorCampo}>EMP-2023-1247</div>
              </div>
              <div className={stylescardstatus.campoInfo}>
                <div className={stylescardstatus.etiquetaCampo}>Departamento</div>
                <div className={stylescardstatus.valorCampo}>Desarrollo</div>
              </div>
              <div className={stylescardstatus.campoInfo}>
                <div className={stylescardstatus.etiquetaCampo}>Responsable</div>
                <div className={stylescardstatus.valorCampo}>Juan Pérez García</div>
              </div>
              <div className={stylescardstatus.campoInfo}>
                <div className={stylescardstatus.etiquetaCampo}>Fecha de Emisión</div>
                <div className={stylescardstatus.valorCampo}>01/2023</div>
              </div>
            </div>
          </div>
          {/* Panel de acciones lateral */}
          <div className={stylescardstatus.panelAcciones}>
            <h2 className={stylescardstatus.tituloSeccion}>Acciones de Tarjeta</h2>
            {/* Switch para bloquear tarjeta */}
            <div className={stylescardstatus.switchContainer}>
              <label className={stylescardstatus.switch}>
                <input 
                  type="checkbox" 
                  checked={isCardBlocked}
                  onChange={toggleCardBlock}
                />
                <span className={stylescardstatus.slider}></span>
              </label>
              <div>
                <div className={stylescardstatus.switchLabel}>
                  {isCardBlocked ? 'Tarjeta Bloqueada' : 'Tarjeta Activa'}
                </div>
                <div className={stylescardstatus.switchDescription}>
                  {isCardBlocked 
                    ? 'Tu tarjeta está temporalmente bloqueada' 
                    : 'Desliza para bloquear temporalmente tu tarjeta'
                  }
                </div>
              </div>
            </div>
            {/* Botón de reportar pérdida */}
            <button className={`${stylescardstatus.botonAccion} ${stylescardstatus.botonSecundario}`} onClick={reportLoss}>
              <span>Bloquear Permanentemente</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
