import React, { useState } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import styles from './AdminHomeScreen.module.css';
import { Eye, User, Mail, CreditCard, DoorClosed, UserCheck, X } from 'lucide-react';
import ModalLogout from '../../components/logout/ModalLogout';

// Importar imágenes de usuarios
import anaGomezFoto from "../../assets/users/anagomez.jpg";
import luisTorresFoto from "../../assets/users/luistorres.jpg";
import mariaLopezFoto from "../../assets/users/marialopez.png";
import javierVazquezFoto from "../../assets/users/userfoto2.png";

const AdminHomeScreen = () => {
  const [alertaVisible, setAlertaVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // NUEVO: estado para mostrar modal de logout
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

  // NUEVO: función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    window.location.href = '/'; // O usa navigate('/') si usas react-router v6+
  };

  // Datos de accesos recientes actualizados con imágenes específicas para cada usuario
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

  // Datos del administrador
  const userProfile = {
    name: 'Juan Pérez',
    role: 'Administrador',
    email: 'juan.perez@ejemplo.com',
    lastAccess: '25/06/2025 - 08:10 AM',
    foto: javierVazquezFoto
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {/* Menú de navegación con soporte para modal logout */}
        <NavigationMenu
          userType="admin"
          onLogoutClick={() => setShowLogout(true)}
        />

        {/* Dashboard principal */}
        <div className={styles.dashboardContainer}>
          <main className={styles.contenedorDashboard}>
            {/* Alerta de puerta abierta */}
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

            {/* Perfil personalizado del usuario */}
            <div className={styles.perfilUsuario}>
              <div className={styles.avatarPerfil}>
                <img
                  className={styles.avatarPerfil}
                  src={userProfile.foto}
                  alt={`${userProfile.name} - usuario administrador`}
                />
              </div>
              <div className={styles.informacionPerfil}>
                <div className={styles.encabezadoPerfil}>
                  <h1>¡Hola, {userProfile.name}!</h1>
                  <span className={styles.badgeAdministrador}>ADMINISTRADOR</span>
                </div>
                <div className={styles.detallesUsuario}>
                  <p>Bienvenido a tu panel de control</p>
                  <p className={styles.textoBienvenida}>{userProfile.email}</p>
                  <p className={styles.textoBienvenida}>Último acceso: {userProfile.lastAccess}</p>
                </div>
              </div>
            </div>

            {/* Grid principal */}
            <div className={styles.gridDashboard}>
              {/* Contenedor unificado para tarjetas de personas y estado */}
              <div className={styles.contenedorTarjetasUnificado}>
                {/* Tarjeta de personas ingresadas */}
                <div className={styles.tarjetaPersonas}>
                  <h2 className={styles.tituloPersonas}>Personas ingresadas</h2>
                  <span className={styles.numeroPersonas}>1245</span>
                  <span className={styles.etiquetaPersonas}>
                    Total de accesos
                  </span>
                </div>
                {/* Tarjeta de estado de puerta */}
                <div className={styles.tarjetaEstado}>
                  <h2 className={styles.tituloEstado}>Estado de puerta</h2>
                  <span className={styles.estadoPuerta}>Abierta</span>
                  <span className={styles.etiquetaEstado}>Estado actual</span>
                </div>
              </div>

              {/* Tarjeta de accesos recientes */}
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

      {/* MODAL LOGOUT */}
      <ModalLogout
        visible={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default AdminHomeScreen;
