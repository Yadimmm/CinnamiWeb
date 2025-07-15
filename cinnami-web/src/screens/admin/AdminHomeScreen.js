import React, { useState, useEffect } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import styles from './AdminHomeScreen.module.css';
import ModalLogout from '../../components/logout/ModalLogout';
import { Eye, User, Mail, CreditCard, DoorClosed, UserCheck, X } from 'lucide-react';

import anaGomezFoto from "../../assets/users/anagomez.jpg";
import luisTorresFoto from "../../assets/users/luistorres.jpg";
import mariaLopezFoto from "../../assets/users/marialopez.png";
import javierVazquezFoto from "../../assets/users/userfoto2.png";

// --- Utilidad para formato de fecha ---
function formatDate(dateString) {
  if (!dateString) return 'Nunca';
  const now = new Date();
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Nunca';

  const isToday = now.toDateString() === date.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = yesterday.toDateString() === date.toDateString();
  const hora = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isToday) return `Hoy a las ${hora}`;
  if (isYesterday) return `Ayer a las ${hora}`;
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' - ' + hora;
}

// ---------- ALERTA flotante fuera de la tarjeta ----------
function AlertOutside({ type, msg }) {
  let c = styles.alertaAnimada;
  if (type === "success") c += " " + styles.alertaSuccess;
  if (type === "error") c += " " + styles.alertaDanger;
  if (type === "warning") c += " " + styles.alertaWarning;
  return (
    <div className={c}>
      {msg}
    </div>
  );
}

// ---------- Modal de confirmación para bloqueo permanente ----------
function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 11 }}>
          ¿Bloquear permanentemente esta tarjeta?
        </p>
        <p style={{ marginBottom: 20, color: "#764545" }}>
          Esta acción es irreversible y solo un administrador podrá restaurarla.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className={styles.confirmBtn} onClick={onConfirm} disabled={loading}>
            Sí, bloquear
          </button>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- TARJETA VIRTUAL ADMIN FLIP 3D (Back Mini) ----------
function AdminVirtualCard3D({ user, card, onStatusChange, onAlert }) {
  const [flipped, setFlipped] = useState(false);
  const [active, setActive] = useState(card?.state !== false);
  const [permBlocked, setPermBlocked] = useState(!!card?.permanentBlocked);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActive(card?.state !== false);
    setPermBlocked(!!card?.permanentBlocked);
  }, [card]);

  // --- FUNCIONA IGUAL QUE EN CardStatusUser ---
  const handleSwitch = async (e) => {
    e.stopPropagation();
    if (!card || permBlocked || loading) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    console.log("Token:", token);
    console.log("Card._id:", card._id);

    try {
      const endpoint = active
        ? `http://localhost:3000/api/auth/cards/${card._id}/disable`
        : `http://localhost:3000/api/auth/cards/${card._id}/enable`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActive(!active);
        onAlert &&
          onAlert({
            type: active ? "warning" : "success",
            msg: active
              ? "Tarjeta bloqueada temporalmente. Actívala cuando la necesites."
              : "Tarjeta activada y lista para usarse."
          });
        if (onStatusChange) onStatusChange({ active: !active, permBlocked });
      } else {
        onAlert && onAlert({ type: "error", msg: data.message || "No se pudo cambiar el estado de la tarjeta." });
      }
    } catch (err) {
      onAlert && onAlert({ type: "error", msg: "No se pudo comunicar con el servidor." });
    }
    setLoading(false);
  };

  const handlePermanentBlock = async () => {
    setShowConfirm(false);
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://localhost:3000/api/auth/cards/${card._id}/permanent-block`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.ok) {
        setPermBlocked(true);
        onAlert &&
          onAlert({
            type: "error",
            msg: "¡Tarjeta bloqueada permanentemente! Solo un administrador puede desbloquearla."
          });
        if (onStatusChange) onStatusChange({ active, permBlocked: true });
      } else {
        onAlert && onAlert({ type: "error", msg: "No se pudo bloquear la tarjeta permanentemente." });
      }
    } catch {
      onAlert && onAlert({ type: "error", msg: "No se pudo comunicar con el servidor." });
    }
    setLoading(false);
  };

  if (!card || permBlocked) {
    return (
      <div className={styles.adminVirtualCard3D} style={{
        background: '#f7f4ee', opacity: 0.85,
        border: "1.5px dashed #bbaf99", display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 138, borderRadius: 18
      }}>
        <div style={{ color: "#967848", fontWeight: 600, fontSize: 18, textAlign: "center" }}>
          {permBlocked ? "Tarjeta bloqueada permanentemente" : "No tienes una tarjeta asignada"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer3D}>
      <div
        className={`${styles.adminVirtualCard3D} ${flipped ? styles.flipped : ""}`}
        tabIndex={0}
        aria-label="Tarjeta virtual"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onFocus={() => setFlipped(true)}
        onBlur={() => setFlipped(false)}
      >
        {/* FRONT */}
        <div className={`${styles.cardFace} ${styles.cardFront}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><span style={{ fontStyle: "italic" }}>CINNAMI</span></span>
            <span className={styles.cardType}>Smart Card</span>
            <div className={styles.chip} />
          </div>
          <div className={styles.cardRowInfo}>
            <div className={styles.cardLeftInfo}>
              <div className={styles.cardName}>{user.firstName} {user.lastName}</div>
              <div className={styles.cardRole}>{user.role}</div>
              <div className={styles.cardUidLabel}>UID: <span className={styles.cardUid}>{card.uid}</span></div>
            </div>
            <img
              className={styles.cardAvatar}
              src={user.foto}
              alt="user"
            />
          </div>
          <span className={styles.cardFlipIcon}>↻</span>
        </div>
        {/* BACK (mini y compacto) */}
        <div className={`${styles.cardFace} ${styles.cardBackMini}`}>
          <div className={styles.cardBackMiniInner}>
            <div className={styles.switchContainerMini}>
              <label className={styles.switchMini}>
                <input
                  type="checkbox"
                  checked={active && !permBlocked}
                  disabled={permBlocked || loading}
                  onChange={handleSwitch}
                  aria-label={active ? "Bloquear tarjeta temporalmente" : "Desbloquear tarjeta temporalmente"}
                  tabIndex={flipped ? 0 : -1}
                />
                <span className={styles.sliderMini}></span>
              </label>
              <div>
                <div className={styles.switchTitleMini}>
                  {permBlocked
                    ? "Tarjeta Bloqueada"
                    : active
                      ? "Tarjeta Activa"
                      : "Tarjeta Bloqueada"}
                </div>
                <div className={styles.switchSubtitleMini}>
                  {permBlocked
                    ? "Permanente"
                    : active
                      ? "Desliza para bloquear"
                      : "Desliza para activar"}
                </div>
              </div>
            </div>
            <button
              className={styles.bloquearPermBtnGrandeMini}
              onClick={() => setShowConfirm(true)}
              disabled={permBlocked || loading}
            >
              Bloquear Permanente
            </button>
          </div>
        </div>
      </div>
      {/* Modal confirmación */}
      {showConfirm && (
        <ConfirmModal
          onConfirm={handlePermanentBlock}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

// ================== PANTALLA PRINCIPAL =====================
export default function AdminHomeScreen() {
  const [alertaVisible, setAlertaVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [card, setCard] = useState(null);
  const [alerta, setAlerta] = useState(null);

  // --- LEER USUARIO AUTENTICADO ---
  let userProfile = {
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    lastLogin: '',
    foto: javierVazquezFoto,
    cardId: '',
  };
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userProfile = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role === 'admin' ? 'Administrador' : 'Docente',
        email: user.email || '',
        lastLogin: formatDate(user.lastLogin),
        foto: user.foto || javierVazquezFoto,
        cardId: user.cardId || '',
      };
    }
  } catch {}

  // --- Cargar la tarjeta real desde el backend ---
  useEffect(() => {
    if (!userProfile.cardId) return;
    fetch('http://localhost:3000/api/auth/cards', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        const cards = data.cards || [];
        const found = cards.find(
          c => c._id === userProfile.cardId || c.uid === userProfile.cardId
        );
        setCard(found || null);
      });
  }, [userProfile.cardId]);

  // Auto-cierra alerta flotante
  useEffect(() => {
    if (!alerta) return;
    const timeout = setTimeout(() => setAlerta(null), 2700);
    return () => clearTimeout(timeout);
  }, [alerta]);

  const cerrarAlerta = () => setAlertaVisible(false);
  const handleShowDetails = (usuario) => {
    setSelectedUser(usuario);
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // --- ACCESOS RECIENTES DEMO ---
  const accesosRecientes = [
    {
      id: '1',
      nombre: "Ana Gómez",
      username: "ana.gomez",
      codigo: "A12345",
      iniciales: "AG",
      ubicacion: "Puerta Norte",
      tiempo: "08:15 AM • 27 Jun 2025",
      role: "Docente",
      email: "ana.gomez@ejemplo.com",
      firstName: "Ana",
      lastName: "Gómez",
      cardId: "A12345",
      status: "Activo",
      door: "Puerta Norte",
      foto: anaGomezFoto
    },
    {
      id: '2',
      nombre: "Luis Torres",
      username: "luis.torres",
      codigo: "B23456",
      iniciales: "LT",
      ubicacion: "Puerta Principal",
      tiempo: "08:20 AM • 27 Jun 2025",
      role: "Administrador",
      email: "luis.torres@ejemplo.com",
      firstName: "Luis",
      lastName: "Torres",
      cardId: "B23456",
      status: "Inactivo",
      door: "Puerta Principal",
      foto: luisTorresFoto
    },
    {
      id: '3',
      nombre: "María López",
      username: "maria.lopez",
      codigo: "C34567",
      iniciales: "ML",
      ubicacion: "Puerta Este",
      tiempo: "08:25 AM • 27 Jun 2025",
      role: "Estudiante",
      email: "maria.lopez@ejemplo.com",
      firstName: "María",
      lastName: "López",
      cardId: "C34567",
      status: "Activo",
      door: "Puerta Este",
      foto: mariaLopezFoto
    }
  ];

  return (
    <>
      <div className={styles.containerPrincipal}>
        <NavigationMenu
          userType={userProfile.role === 'Administrador' ? "admin" : "docente"}
          onLogoutClick={() => setShowLogout(true)}
        />
        <div className={styles.dashboardContainer}>
          <main className={styles.contenedorDashboard}>
            {/* ALERTA FLOTANTE (fuera de la tarjeta) */}
            {alerta && <AlertOutside type={alerta.type} msg={alerta.msg} />}

            {alertaVisible && (
              <div className={styles.alertaPuerta}>
                <span className={styles.textoAlerta}>
                  La puerta ha estado abierta por más de 15 minutos
                </span>
                <button
                  className={styles.botonCerrarAlerta}
                  onClick={cerrarAlerta}
                >
                  ×
                </button>
              </div>
            )}

            {/* ---- GRID LAYOUT PRINCIPAL ---- */}
            <div className={styles.superiorLayout}>
              <div className={styles.leftColumn}>
                {/* PERFIL del USUARIO conectado */}
                <div className={styles.perfilUsuario}>
                  <div className={styles.avatarPerfil}>
                    <img
                      className={styles.avatarPerfil}
                      src={userProfile.foto}
                      alt={`${userProfile.firstName} ${userProfile.lastName} - usuario`}
                    />
                  </div>
                  <div className={styles.informacionPerfil}>
                    <div className={styles.encabezadoPerfil}>
                      <h1>
                        ¡Hola, {userProfile.firstName} {userProfile.lastName}!
                      </h1>
                      <span className={
                        userProfile.role === 'Administrador'
                          ? styles.badgeAdministrador
                          : styles.badgeDocente
                      }>
                        {userProfile.role.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.detallesUsuario}>
                      <p>Bienvenido a tu panel de control</p>
                      <p className={styles.textoBienvenida}>{userProfile.email}</p>
                      <p className={styles.textoBienvenida}>
                        Último acceso: {userProfile.lastLogin}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.rightColumn}>
                {/* ---- TARJETA ADMIN VIRTUAL (panel de acciones) ---- */}
                <AdminVirtualCard3D
                  user={userProfile}
                  card={card}
                  onStatusChange={() => {}}
                  onAlert={setAlerta}
                />
              </div>
            </div>

            {/* Grid principal */}
            <div className={styles.gridDashboard}>
              <div className={styles.contenedorTarjetasUnificado}>
                <div className={styles.tarjetaPersonas}>
                  <h2 className={styles.tituloPersonas}>Personas ingresadas</h2>
                  <span className={styles.numeroPersonas}>1245</span>
                  <span className={styles.etiquetaPersonas}>
                    Total de accesos
                  </span>
                </div>
                <div className={styles.tarjetaEstado}>
                  <h2 className={styles.tituloEstado}>Estado de puerta</h2>
                  <span className={styles.estadoPuerta}>Abierta</span>
                  <span className={styles.etiquetaEstado}>Estado actual</span>
                </div>
              </div>
              <div className={styles.tarjetaAccesos}>
                <div className={styles.encabezadoAccesos}>
                  <h2 className={styles.tituloAccesos}>
                    Registro de accesos recientes
                  </h2>
                </div>
                <div className={styles.listaAccesos}>
                  {accesosRecientes.map((acceso) => (
                    <div key={acceso.id} className={styles.itemAcceso}>
                      <div className={styles.avatarAcceso}>
                        <img
                          className={styles.avatarUsers}
                          src={acceso.foto}
                          alt={`${acceso.nombre} - ${acceso.role}`}
                        />
                      </div>
                      <div className={styles.infoAcceso}>
                        <div className={styles.nombreAcceso}>{acceso.nombre}</div>
                        <div className={styles.codigoAcceso}>
                          ({acceso.codigo})
                        </div>
                      </div>
                      <div className={styles.detallesAcceso}>
                        <div className={styles.ubicacionAcceso}>
                          {acceso.ubicacion}
                        </div>
                        <div className={styles.tiempoAcceso}>{acceso.tiempo}</div>
                      </div>
                      <button
                        className={styles.botonInfo}
                        onClick={() => handleShowDetails(acceso)}
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal de detalles del usuario */}
      {modalVisible && selectedUser && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={closeModal}>
              <X size={24} />
            </button>
            <div className={styles.userModalHeader}>
              <div className={styles.userModalAvatar}>
                <img
                  src={selectedUser.foto}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <h3 className={styles.modalTitle}>
                {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p className={styles.userModalEmail}>{selectedUser.email}</p>
              <div className={`${styles.userModalRole} ${selectedUser.role === 'Administrador' ? styles.userRoleAdmin : ''}`}>
                <span className={styles.userModalRoleText}>{selectedUser.role}</span>
              </div>
            </div>
            <div className={styles.userDetailsContainer}>
              <div className={styles.userDetailRow}>
                <User size={20} className={styles.userDetailIcon} />
                <span className={styles.userDetailLabel}>Usuario:</span>
                <span className={styles.userDetailValue}>{selectedUser.username}</span>
              </div>
              <div className={styles.userDetailRow}>
                <Mail size={20} className={styles.userDetailIcon} />
                <span className={styles.userDetailLabel}>Correo:</span>
                <span className={styles.userDetailValue}>{selectedUser.email}</span>
              </div>
              <div className={styles.userDetailRow}>
                <User size={20} className={styles.userDetailIcon} />
                <span className={styles.userDetailLabel}>Nombres:</span>
                <span className={styles.userDetailValue}>{selectedUser.firstName}</span>
              </div>
              <div className={styles.userDetailRow}>
                <User size={20} className={styles.userDetailIcon} />
                <span className={styles.userDetailLabel}>Apellidos:</span>
                <span className={styles.userDetailValue}>{selectedUser.lastName}</span>
              </div>
              <div className={styles.userDetailRow}>
                <CreditCard size={20} className={styles.userDetailIcon} />
                <span className={styles.userDetailLabel}>ID Tarjeta:</span>
                <span className={styles.userDetailValue}>{selectedUser.cardId}</span>
              </div>
              <div className={styles.userDetailRow}>
                <DoorClosed size={20} className={styles.userDetailIcon} />
                <span className={styles.userDetailLabel}>Puerta:</span>
                <span className={styles.userDetailValue}>{selectedUser.door}</span>
              </div>
              <div className={styles.userDetailRow}>
                <UserCheck size={20} className={styles.userDetailIcon} />
                <span className={styles.userDetailLabel}>Estado:</span>
                <span className={`${styles.userDetailValue} ${selectedUser.status === 'Activo' ? styles.activeUser : styles.inactiveUser}`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ModalLogout
        visible={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
