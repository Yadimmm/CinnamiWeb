import React, { useEffect, useState } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import stylescardstatus from './CardStatusScreen.module.css';
import globalstyles from '../../styles/globalStyles.module.css';
import { useLoader } from "../../context/LoaderContext"; // Loader global

// MODAL ALERTA personalizada
function AlertModal({ message, onClose, type = 'info' }) {
  return (
    <div className={stylescardstatus.alertOverlay}>
      <div
        className={`${stylescardstatus.alertBox} ${
          type === 'success'
            ? stylescardstatus.success
            : type === 'error'
            ? stylescardstatus.error
            : stylescardstatus.info
        }`}
      >
        <div className={stylescardstatus.alertContent}>
          <span style={{ fontWeight: 'bold', fontSize: 20 }}>{message.title}</span>
          <div style={{ marginTop: 8, marginBottom: 12 }}>{message.body}</div>
          <button
            className={stylescardstatus.alertButton}
            onClick={onClose}
            style={{
              background: '#b88d4a',
              color: 'white',
              borderRadius: 6,
              padding: '7px 25px',
              border: 'none',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              marginTop: 6
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// MODAL DE CONFIRMACIÓN personalizada
function ConfirmModal({ title, body, onConfirm, onCancel }) {
  return (
    <div className={stylescardstatus.alertOverlay}>
      <div className={stylescardstatus.alertBox}>
        <div className={stylescardstatus.alertContent}>
          <span style={{ fontWeight: 'bold', fontSize: 20 }}>{title}</span>
          <div style={{ marginTop: 8, marginBottom: 14 }}>{body}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className={stylescardstatus.alertButton}
              onClick={onConfirm}
              style={{
                background: '#b88d4a',
                color: 'white',
                borderRadius: 6,
                padding: '7px 22px',
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer'
              }}
            >
              Sí, bloquear
            </button>
            <button
              className={stylescardstatus.alertButton}
              onClick={onCancel}
              style={{
                background: '#b6b1a6',
                color: '#333',
                borderRadius: 6,
                padding: '7px 18px',
                border: 'none',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [cardBlocked, setCardBlocked] = useState(false);
  const [permanentBlocked, setPermanentBlocked] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { showLoader, hideLoader } = useLoader(); // Loader global

  // Cargar usuario y tarjetas
  useEffect(() => {
    async function fetchData() {
      showLoader("Cargando información...");
      try {
        const usr = getCurrentUser();
        setUser(usr);

        const res = await fetch('http://localhost:3000/api/auth/cards', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const cards = data.cards || [];
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
      } catch {}
      hideLoader();
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Cambia el estado temporal de la tarjeta
  const toggleCardBlock = async () => {
    if (!card || permanentBlocked) return;
    showLoader(cardBlocked ? "Activando tarjeta..." : "Bloqueando tarjeta...");
    try {
      const newState = !cardBlocked;
      const res = await fetch(
        `http://localhost:3000/api/auth/cards/${card._id}/${newState ? 'disable' : 'enable'}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      const data = await res.json();
      if (res.ok) {
        setCard(data.card);
        setCardBlocked(data.card.state === false);
        setAlert({
          title: newState ? "¡Tarjeta Bloqueada!" : "¡Tarjeta Reactivada!",
          body: newState
            ? "Tu tarjeta ha sido bloqueada temporalmente. Recuerda activarla cuando la necesites."
            : "Tu tarjeta fue activada exitosamente y puedes volver a usarla."
        });
      } else {
        setAlert({
          title: "Error",
          body: "No se pudo cambiar el estado de la tarjeta."
        });
      }
    } catch {
      setAlert({
        title: "Error de conexión",
        body: "No se pudo comunicar con el servidor. Intenta más tarde."
      });
    }
    hideLoader();
  };

  // Bloqueo permanente (requiere confirmación y endpoint)
  const reportLoss = () => setShowConfirm(true);

  const handlePermanentBlock = async () => {
    setShowConfirm(false);
    showLoader("Bloqueando permanentemente...");
    try {
      const res = await fetch(
        `http://localhost:3000/api/auth/cards/${card._id}/permanent-block`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      if (res.ok) {
        setPermanentBlocked(true);
        setAlert({
          title: "¡Bloqueo Permanente!",
          body:
            "Tu tarjeta ha sido bloqueada permanentemente. Contacta al administrador para obtener una nueva o pedir reactivación."
        });
      } else {
        setAlert({
          title: "Error",
          body: "No se pudo bloquear la tarjeta permanentemente."
        });
      }
    } catch {
      setAlert({
        title: "Error de conexión",
        body: "No se pudo comunicar con el servidor. Intenta más tarde."
      });
    }
    hideLoader();
  };

  // Si no hay usuario o tarjeta
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

  // Estilos para bloqueo permanente o temporal
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
      {/* Modal personalizado para alertas */}
      {alert && (
        <AlertModal message={alert} onClose={() => setAlert(null)} />
      )}
      {/* Modal de confirmación para bloqueo permanente */}
      {showConfirm && (
        <ConfirmModal
          title="¿Seguro que quieres bloquear la tarjeta permanentemente?"
          body="Esta acción es irreversible y solo un administrador podrá desbloquear la tarjeta después. ¿Deseas continuar?"
          onConfirm={handlePermanentBlock}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
