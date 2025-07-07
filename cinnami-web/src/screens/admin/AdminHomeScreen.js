import React, { useState } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import styles from './AdminHomeScreen.module.css';
import { Eye, User, Mail, CreditCard, DoorClosed, UserCheck, X } from 'lucide-react';
import ModalLogout from '../../components/logout/ModalLogout';
import anaGomezFoto from "../../assets/users/anagomez.jpg";
import luisTorresFoto from "../../assets/users/luistorres.jpg";
import mariaLopezFoto from "../../assets/users/marialopez.png";
import javierVazquezFoto from "../../assets/users/userfoto2.png";

// ---- Formateador avanzado ----
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

const AdminHomeScreen = () => {
  const [alertaVisible, setAlertaVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);

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

  // --- LEER DATOS DEL USUARIO AUTENTICADO ---
  let userProfile = {
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    lastLogin: '',
    foto: javierVazquezFoto
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
        foto: javierVazquezFoto // Si algún día agregas foto personalizada: user.foto || javierVazquezFoto
      };
    }
  } catch { /* Si hay error no pasa nada */ }

  // Accesos recientes (esto es DEMO)
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
};

export default AdminHomeScreen;
