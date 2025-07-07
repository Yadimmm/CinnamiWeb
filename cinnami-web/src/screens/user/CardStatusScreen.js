import React, { useEffect, useState } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import stylescardstatus from './CardStatusScreen.module.css';
import globalstyles from '../../styles/globalStyles.module.css';

// Utilidad para obtener el usuario logueado del localStorage
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export default function CardStatusScreen({ onLogoutClick }) {
  const [user, setUser] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardBlocked, setCardBlocked] = useState(false);
  const [permanentBlocked, setPermanentBlocked] = useState(false);

  // Cargar usuario y todas las tarjetas
  useEffect(() => {
    const usr = getCurrentUser();
    setUser(usr);

    // 1. Cargar todas las tarjetas
    fetch('http://localhost:3000/api/auth/cards', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        const cards = data.cards || [];

        // 2. Buscar la tarjeta asignada usando _id O uid
        if (usr && usr.cardId) {
          const foundCard = cards.find(
            c => c._id === usr.cardId || c.uid === usr.cardId
          );
          if (foundCard) {
            setCard(foundCard);
            setCardBlocked(foundCard.state === false);
            setPermanentBlocked(!!foundCard.permanentBlocked);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Cambia el estado temporal de la tarjeta (activar/desactivar)
  const toggleCardBlock = async () => {
    if (!card) return;
    setLoading(true);
    try {
      // Cambiar el estado temporal
      const newState = !cardBlocked;
      // Busca el endpoint correcto según el estado
      const res = await fetch(`http://localhost:3000/api/auth/cards/${card._id}/${newState ? 'disable' : 'enable'}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCard(data.card);
        setCardBlocked(data.card.state === false);
        if (newState) {
          setTimeout(() => alert('Tu tarjeta ha sido bloqueada temporalmente.'), 300);
        } else {
          setTimeout(() => alert('Tu tarjeta ha sido reactivada exitosamente.'), 300);
        }
      } else {
        alert('Error al cambiar el estado de la tarjeta.');
      }
    } catch {
      alert('Error de conexión.');
    }
    setLoading(false);
  };

  // Bloqueo permanente (requiere campo en la BD)
  const reportLoss = async () => {
    if (!card) return;
    const confirmed = window.confirm('¿Estás seguro de que quieres bloquear permanentemente tu tarjeta? Esta acción requerirá contactar al administrador para reactivarla.');
    if (confirmed) {
      setLoading(true);
      try {
        // Aquí llamamos a un endpoint especial para el bloqueo permanente
        const res = await fetch(`http://localhost:3000/api/auth/cards/${card._id}/permanent-block`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          setPermanentBlocked(true);
          alert('Tu solicitud de bloqueo permanente ha sido realizada. Contacta al administrador para más información.');
        } else {
          alert('No se pudo bloquear la tarjeta permanentemente.');
        }
      } catch {
        alert('Error de conexión.');
      }
      setLoading(false);
    }
  };

  // Si no hay usuario o tarjeta, mostramos mensaje
  if (loading) {
    return (
      <div className={stylescardstatus.containerPrincipal}>
        <NavigationMenu userType="docente" onLogoutClick={onLogoutClick} />
        <main className={stylescardstatus.contenedorDashboard}>
          <h1 className={globalstyles.title}>Cargando...</h1>
        </main>
      </div>
    );
  }

  if (!user || !card) {
    return (
      <div className={stylescardstatus.containerPrincipal}>
        <NavigationMenu userType="docente" onLogoutClick={onLogoutClick} />
        <main className={stylescardstatus.contenedorDashboard}>
          <h1 className={globalstyles.title}>No se encontró información de la tarjeta asignada.</h1>
        </main>
      </div>
    );
  }

  // Estilos para bloqueo permanente
  const bloqueada = cardBlocked || permanentBlocked;

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
                <div className={`${stylescardstatus.puntoEstado} ${bloqueada ? stylescardstatus.puntoEstadoBloqueado : ''}`}></div>
                <span className={`${stylescardstatus.textoEstado} ${bloqueada ? stylescardstatus.textoEstadoBloqueado : ''}`}>
                  {permanentBlocked
                    ? "Tarjeta Bloqueada Permanentemente"
                    : (cardBlocked ? "Tarjeta Bloqueada" : "Tarjeta Activa")}
                </span>
              </div>
            </div>
            {/* Tarjeta virtual */}
            <div className={stylescardstatus.tarjetaVirtual + (bloqueada ? ` ${stylescardstatus.tarjetaBloqueada}` : '')}>
              <div className={stylescardstatus.encabezadoTarjeta}>
                <div className={stylescardstatus.infoEmpresa}>
                  <div className={stylescardstatus.nombreEmpresa}>CINNAMI</div>
                  <div className={stylescardstatus.lemaEmpresa}>Smart solutions for a connected world</div>
                </div>
                <div className={stylescardstatus.chipTarjeta}></div>
              </div>
              <div className={stylescardstatus.infoUsuario}>
                <div className={stylescardstatus.nombreUsuario}>
                  {user.firstName} {user.lastName}
                </div>
                <div className={stylescardstatus.codigoUsuario}>
                  {card.uid}
                </div>
              </div>
              <div className={stylescardstatus.pieTarjeta}>
                <div className={stylescardstatus.tipoAcceso}>EMPLEADO</div>
              </div>
            </div>
            {/* Información de la tarjeta */}
            <div className={stylescardstatus.infoTarjeta}>
              <div className={stylescardstatus.campoInfo}>
                <div className={stylescardstatus.etiquetaCampo}>Responsable</div>
                <div className={stylescardstatus.valorCampo}>{user.firstName} {user.lastName}</div>
              </div>
              <div className={stylescardstatus.campoInfo}>
                <div className={stylescardstatus.etiquetaCampo}>Correo electrónico</div>
                <div className={stylescardstatus.valorCampo}>{user.email}</div>
              </div>
              <div className={stylescardstatus.campoInfo}>
                <div className={stylescardstatus.etiquetaCampo}>UID de la tarjeta</div>
                <div className={stylescardstatus.valorCampo}>{card.uid}</div>
              </div>
              <div className={stylescardstatus.campoInfo}>
                <div className={stylescardstatus.etiquetaCampo}>Fecha de emisión</div>
                <div className={stylescardstatus.valorCampo}>
                  {card.issueDate ? new Date(card.issueDate).toLocaleDateString('es-MX') : "Desconocida"}
                </div>
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
                  checked={cardBlocked}
                  onChange={toggleCardBlock}
                  disabled={permanentBlocked}
                />
                <span className={stylescardstatus.slider}></span>
              </label>
              <div>
                <div className={stylescardstatus.switchLabel}>
                  {bloqueada ? 'Tarjeta Bloqueada' : 'Tarjeta Activa'}
                </div>
                <div className={stylescardstatus.switchDescription}>
                  {permanentBlocked
                    ? "Tu tarjeta está bloqueada permanentemente."
                    : cardBlocked
                      ? "Tu tarjeta está temporalmente bloqueada."
                      : "Desliza para bloquear temporalmente tu tarjeta"}
                </div>
              </div>
            </div>
            {/* Botón de reportar pérdida */}
            <button
              className={`${stylescardstatus.botonAccion} ${stylescardstatus.botonSecundario}`}
              onClick={reportLoss}
              disabled={permanentBlocked}
            >
              <span>Bloquear Permanentemente</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
