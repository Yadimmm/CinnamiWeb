import React, { useState, useEffect } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import styles from './AdminHomeScreen.module.css';
import ModalLogout from '../../components/logout/ModalLogout';
import { Eye, User, Mail, CreditCard, DoorClosed, UserCheck, X } from 'lucide-react';
import javierVazquezFoto from "../../assets/users/userfoto2.png";
import { safeImgSrc } from '../../utils/safeImgSrc';

//Utilidad para sanitizar strings y prevenir XSS
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>&"']/g, function(match) {
    const escapeMap = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return escapeMap[match];
  });
}

//Utilidad para validar y parsear JSON de forma segura
function safeJSONParse(jsonString, defaultValue = null) {
  try {
    if (!jsonString || typeof jsonString !== 'string') return defaultValue;
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.warn('Error parsing JSON:', error);
    return defaultValue;
  }
}

//Utilidad para obtener valores seguros del localStorage
function getSafeLocalStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? item : defaultValue;
  } catch (error) {
    console.warn(`Error accessing localStorage key "${key}":`, error);
    return defaultValue;
  }
}

//Utilidad para formato de fecha
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

//ALERTA flotante fuera de la tarjeta
function AlertOutside({ type, msg }) {
  let c = styles.alertaAnimada;
  if (type === "success") c += " " + styles.alertaSuccess;
  if (type === "error") c += " " + styles.alertaDanger;
  if (type === "warning") c += " " + styles.alertaWarning;
  
  // No sanitizamos aquí, porque msg puede ser HTML (para el temporizador)
  return (
    <div className={c} dangerouslySetInnerHTML={{ __html: msg }} />
  );
}

//Modal de confirmación para bloqueo permanente
function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className={styles.globalModalOverlay}>
      <div className={styles.globalModalContent}>
        <h2 className={styles.globalModalTitle}>¿Bloquear permanentemente esta tarjeta?</h2>
        <p className={styles.globalModalMessage}>
          Esta acción es <b>irreversible</b> y solo un <span style={{ color: "var(--color-cafe-principal)" }}>administrador</span> podrá restaurarla.
        </p>
        <div className={styles.globalModalActions}>
          <button
            className={styles.globalModalConfirm}
            onClick={onConfirm}
            disabled={loading}
          >
            Sí, bloquear
          </button>
          <button
            className={styles.globalModalCancel}
            onClick={onCancel}
            disabled={loading}
          >
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

  const handleSwitch = async (e) => {
    e.stopPropagation();
    if (!card || permBlocked || loading) return;
    setLoading(true);
    const token = getSafeLocalStorageItem('token');
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

  // --- MODIFICADO TEMPORIZADOR + REDIRECCIÓN ---
  const handlePermanentBlock = async () => {
    setShowConfirm(false);
    setLoading(true);
    const token = getSafeLocalStorageItem('token');
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
            msg: `<b>¡Tarjeta bloqueada permanentemente!</b><br>Serás redirigido al login en <span id="redirect-timer">4</span> segundos...`,
            autoRedirect: true
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

  // Sanitizar datos del usuario para prevenir XSS
  const sanitizedFirstName = sanitizeString(user.firstName);
  const sanitizedLastName = sanitizeString(user.lastName);
  const sanitizedRole = sanitizeString(user.role);
  const sanitizedUid = sanitizeString(card.uid);

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
              <div className={styles.cardName}>{sanitizedFirstName} {sanitizedLastName}</div>
              <div className={styles.cardRole}>{sanitizedRole}</div>
              <div className={styles.cardUidLabel}>UID: <span className={styles.cardUid}>{sanitizedUid}</span></div>
            </div>
            <img
              className={styles.cardAvatar}
              src={safeImgSrc(String(user.foto), javierVazquezFoto)}
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

//PANTALLA PRINCIPAL
export default function AdminHomeScreen() {
  const [alertaPuertaVisible, setAlertaPuertaVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [card, setCard] = useState(null);
  const [alerta, setAlerta] = useState(null);

  //ESTADOS PARA BD
  const [totalPersonas, setTotalPersonas] = useState(0);
  const [estadoPuerta, setEstadoPuerta] = useState({ state: 'Cargando...', name: '' });
  const [accesosRecientes, setAccesosRecientes] = useState([]);

  //LEER USUARIO AUTENTICADO DE FORMA SEGURA
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    lastLogin: '',
    foto: javierVazquezFoto,
    cardId: '',
  });

  useEffect(() => {
    const userStr = getSafeLocalStorageItem('user');
    if (userStr) {
      const user = safeJSONParse(userStr, {});
      setUserProfile({
        firstName: sanitizeString(user.firstName || ''),
        lastName: sanitizeString(user.lastName || ''),
        role: user.role === 'admin' ? 'Administrador' : 'Docente',
        email: sanitizeString(user.email || ''),
        lastLogin: formatDate(user.lastLogin),
        foto: safeImgSrc(user.foto, javierVazquezFoto),
        cardId: sanitizeString(user.cardId || ''),
      });
    }
  }, []);

  //Cargar la tarjeta real desde el backend
  useEffect(() => {
    if (!userProfile.cardId) return;
    const token = getSafeLocalStorageItem('token');
    if (!token) return;

    fetch('http://localhost:3000/api/auth/cards', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const cards = data.cards || [];
        const found = cards.find(
          c => c._id === userProfile.cardId || c.uid === userProfile.cardId
        );
        setCard(found || null);
      })
      .catch(error => {
        console.error('Error loading card:', error);
      });
  }, [userProfile.cardId]);

  //POLLING para recargar datos cada 5 segundos
  useEffect(() => {
    const token = getSafeLocalStorageItem('token');
    if (!token) return;

    const fetchData = () => {
      // Personas ingresadas (conteo)
      fetch('http://localhost:3000/api/auth/personcount/latest', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setTotalPersonas(data.count || 0))
        .catch(() => setTotalPersonas(0));

      // Estado de puerta
      fetch('http://localhost:3000/api/auth/door/latest', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setEstadoPuerta({
            state: data.state || 'desconocido',
            name: sanitizeString(data.name || ''),
            timestamp: data.timestamp
          });

          // Lógica de alerta funcional
          if (data.state === "open" && data.timestamp) {
            const timestamp = new Date(data.timestamp).getTime();
            const now = Date.now();
            const minutosAbierta = (now - timestamp) / 1000 / 60;
            if (minutosAbierta > 5.5) {
              setAlertaPuertaVisible(true);
            } else {
              setAlertaPuertaVisible(false);
            }
          } else {
            setAlertaPuertaVisible(false);
          }
        })
        .catch(() => {
          setEstadoPuerta({ state: 'desconocido', name: '' });
          setAlertaPuertaVisible(false);
        });

      // Accesos recientes desde BD
      fetch('http://localhost:3000/api/auth/access-events/recent', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const sanitizedEvents = (data.events || []).map(event => ({
            ...event,
            userName: sanitizeString(event.userName || ''),
            cardId: sanitizeString(event.cardId || ''),
            doorName: sanitizeString(event.doorName || event.doorId || ''),
            userId: sanitizeString(event.userId || '')
          }));
          setAccesosRecientes(sanitizedEvents);
        })
        .catch(() => setAccesosRecientes([]));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  //Alerta de deshabilitación permanente
  useEffect(() => {
    if (!alerta) return;

    if (alerta.autoRedirect) {
      let seconds = 4; 
      const updateTimer = () => {
        const timerSpan = document.getElementById('redirect-timer');
        if (timerSpan) timerSpan.textContent = seconds;
      };
      updateTimer();
      const interval = setInterval(() => {
        seconds--;
        updateTimer();
        if (seconds <= 0) {
          clearInterval(interval);
          localStorage.clear();
          window.location.href = 'http://localhost:3001/';
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const timeout = setTimeout(() => setAlerta(null), 2700);
      return () => clearTimeout(timeout);
    }
  }, [alerta]);

  const handleShowDetails = (usuario) => {
    // Sanitiza datos del usuario seleccionado
    const sanitizedUser = {
      ...usuario,
      firstName: sanitizeString(usuario.firstName || ''),
      lastName: sanitizeString(usuario.lastName || ''),
      email: sanitizeString(usuario.email || ''),
      username: sanitizeString(usuario.username || ''),
      role: sanitizeString(usuario.role || ''),
      cardId: sanitizeString(usuario.cardId || ''),
      door: sanitizeString(usuario.door || ''),
      status: sanitizeString(usuario.status || '')
    };
    setSelectedUser(sanitizedUser);
    setModalVisible(true);
  };
  
  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback en caso de error
      window.location.href = '/';
    }
  };

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

            {/* ALERTA DE PUERTA FUNCIONAL */}
            {alertaPuertaVisible && (
              <div className={styles.alertaPuerta}>
                <span className={styles.textoAlerta}>
                  La puerta ha estado abierta por más de 5 minutos. Se le aconseja cerrarla.
                </span>
                <button
                  className={styles.botonCerrarAlerta}
                  onClick={() => setAlertaPuertaVisible(false)}
                >
                  ×
                </button>
              </div>
            )}

            {/* GRID LAYOUT PRINCIPAL */}
            <div className={styles.superiorLayout}>
              <div className={styles.leftColumn}>
                {/* PERFIL del USUARIO conectado */}
                <div className={styles.perfilUsuario}>
                  <div className={styles.avatarPerfil}>
                    <img
                      className={styles.avatarPerfil}
                      src={safeImgSrc(String(userProfile.foto), javierVazquezFoto)}
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
                {/* TARJETA ADMIN VIRTUAL PANEL DE ACCIONES*/}
                <AdminVirtualCard3D
                  user={userProfile}
                  card={card}
                  onStatusChange={() => { }}
                  onAlert={setAlerta}
                />
              </div>
            </div>

            {/* Grid principal */}
            <div className={styles.gridDashboard}>
              <div className={styles.contenedorTarjetasUnificado}>
                <div className={styles.tarjetaPersonas}>
                  <h2 className={styles.tituloPersonas}>Personas ingresadas</h2>
                  <span className={styles.numeroPersonas}>{totalPersonas}</span>
                  <span className={styles.etiquetaPersonas}>
                    Total de accesos
                  </span>
                </div>
                <div className={styles.tarjetaEstado}>
                  <h2 className={styles.tituloEstado}>Estado de puerta</h2>
                  <span
                    className={[
                      styles.estadoPuerta,
                      estadoPuerta.state === "open"
                        ? styles.estadoPuertaAbierta
                        : estadoPuerta.state === "close"
                          ? styles.estadoPuertaCerrada
                          : ""
                    ].join(" ")}
                  >
                    {estadoPuerta.state === "open"
                      ? "Abierta"
                      : estadoPuerta.state === "close"
                        ? "Cerrada"
                        : "Desconocido"}
                  </span>
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
                    <div key={acceso._id} className={styles.itemAcceso}>
                      <div className={styles.avatarAcceso}>
                        <img
                          className={styles.avatarUsers}
                          src={safeImgSrc(typeof acceso.foto === 'string' ? acceso.foto : '', javierVazquezFoto)}
                          alt={acceso.userName || acceso.userId || "Usuario"}
                        />
                      </div>
                      <div className={styles.infoAcceso}>
                        <div className={styles.nombreAcceso}>{acceso.userName || "Sin nombre"}</div>
                        <div className={styles.codigoAcceso}>
                          ({acceso.cardId || "Sin tarjeta"})
                        </div>
                      </div>
                      <div className={styles.detallesAcceso}>
                        <div className={styles.ubicacionAcceso}>
                          {acceso.doorName || acceso.doorId || "Desconocido"}
                        </div>
                        <div className={styles.tiempoAcceso}>
                          {acceso.timestamp ? formatDate(acceso.timestamp) : "Sin fecha"}
                        </div>
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
                  src={safeImgSrc(typeof selectedUser.foto === 'string' ? selectedUser.foto : '', javierVazquezFoto)}
                  alt={`${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`}
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
