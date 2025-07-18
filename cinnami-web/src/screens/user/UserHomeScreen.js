import React, { useState, useEffect } from "react";
import NavigationMenu from "../../components/Navigation/NavigationMenu";
import userfoto2 from "../../assets/icons/userfoto2.png";
import { GiDoorHandle } from "react-icons/gi";
import candado from "../../assets/logos/candado.png";
import styles from "./UserHomeScreen.module.css";
import ModalLogout from "../../components/logout/ModalLogout";
import { FaUserEdit } from "react-icons/fa";
import { useLoader } from "../../context/LoaderContext";

//Alerta de cambios para usuario
function UserChangesAlert({ oldData, newData, onClose }) {
  const prettyLabel = {
    firstName: "Nombre(s)",
    lastName: "Apellidos",
    username: "Usuario",
    email: "Correo",
    role: "Rol",
    cardId: "Tarjeta"
  };
// Generar campos cambiados
  const changedFields = [];
  Object.keys(newData).forEach(key => {
    if ((oldData[key] || "") !== (newData[key] || "")) {
      changedFields.push(
        <tr key={key}>
          <td style={{ fontWeight: 600, color: "#383838" }}>{prettyLabel[key] || key}</td>
          <td style={{ color: "#b1a4a4" }}>{oldData[key] || "-"}</td>
          <td style={{ color: "#4caf50", fontWeight: 700 }}>{newData[key] || "-"}</td>
        </tr>
      );
    }
  });

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(80, 80, 80, 0.29)", zIndex: 99, display: "flex",
      alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 22, minWidth: 340, maxWidth: 410,
        boxShadow: "0 8px 32px 0 rgba(60,50,65,0.15)",
        padding: "34px 30px 24px 30px",
        border: "1.8px solid #eee", textAlign: "left",
        animation: "popUpFadeIn 0.26s"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 8 }}>
          <span style={{
            color: "#9764db", fontSize: 32, fontWeight: 900, marginRight: 4,
            display: "inline-block", transform: "translateY(-2px)"
          }}>✔️</span>
          <span style={{ color: "#2eaf5e", fontSize: "1.35rem", fontWeight: 700 }}>
            Usuario actualizado
          </span>
        </div>
        <div style={{ color: "#7a6d8b", fontSize: "1rem", marginBottom: 16 }}>
          Estos campos cambiaron:
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", fontWeight: 700, fontSize: 16, paddingBottom: 5 }}>Campo</th>
              <th style={{ textAlign: "left", fontWeight: 700, fontSize: 16, paddingBottom: 5 }}>Antes</th>
              <th style={{ textAlign: "left", fontWeight: 700, fontSize: 16, paddingBottom: 5 }}>Después</th>
            </tr>
          </thead>
          <tbody>
            {changedFields.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ fontStyle: "italic", color: "#adadad", padding: 10 }}>No hubo cambios.</td>
              </tr>
            ) : changedFields}
          </tbody>
        </table>
        <div style={{ textAlign: "right", marginTop: 14 }}>
          <button
            onClick={onClose}
            style={{
              background: "#b88d4a", color: "#fff", borderRadius: 8,
              border: "none", padding: "8px 22px", fontWeight: 700,
              fontSize: 17, boxShadow: "0 2px 8px 0 #e7d9bf36", cursor: "pointer",
              transition: "background .17s"
            }}
          >Cerrar</button>
        </div>
      </div>
    </div>
  );
}

//Componente principal 
export default function UserHomeScreen() {
  // Estado de usuario
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    lastLogin: "",
    role: "",
    foto: userfoto2,
    cardId: "",
    _id: "",
  });

  const [cardUID, setCardUID] = useState("");
  const [allCards, setAllCards] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [showLogout, setShowLogout] = useState(false);
  const [changesAlert, setChangesAlert] = useState(null); 

  // Loader global
  const { showLoader, hideLoader } = useLoader();

  // Cargar datos de usuario
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserProfile((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        lastLogin: user.lastLogin
          ? new Date(user.lastLogin).toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }) +
            " - " +
            new Date(user.lastLogin).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "Nunca",
        role: user.role === "admin" ? "Administrador" : "Docente",
        foto: userfoto2,
        cardId: user.cardId || "",
        _id: user.id || user._id,
      }));
    }
  }, []);

  // Cargar todas las tarjetas
  useEffect(() => {
    fetch("http://localhost:3000/api/auth/cards", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAllCards(data.cards || []))
      .catch(() => setAllCards([]));
  }, []);

  // Buscar el UID correcto de la tarjeta asignada al usuario
  useEffect(() => {
    if (!userProfile.cardId) {
      setCardUID("");
      return;
    }
    const match = allCards.find(
      (card) =>
        card._id === userProfile.cardId || card.uid === userProfile.cardId
    );
    setCardUID(match ? match.uid : "");
  }, [userProfile.cardId, allCards]);

  //Accesos recientes
  const mockAccessData = [
    {
      id: 1,
      location: "Puerta Principal",
      date: "07/07/2025",
      time: "14:32",
      status: "success",
      icon: <GiDoorHandle />,
    },
    {
      id: 2,
      location: "Puerta Norte",
      date: "07/07/2025",
      time: "09:18",
      status: "failed",
      icon: <GiDoorHandle />,
    },
  ];
  const recentAccesses = mockAccessData.slice(0, 2);
  const totalAllowed = mockAccessData.filter((log) => log.status === "success").length;
  const totalDenied = mockAccessData.filter((log) => log.status === "failed").length;
  const totalAccesses = mockAccessData.length;

  // MODAL de detalles de acceso
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState(null);

  const handleShowDetails = (access) => {
    setSelectedAccess(access);
    setModalVisible(true);
  };

  //MODAL EDICIÓN DE USUARIO
  const openEditUserModal = () => {
    setFormData({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      username: userProfile.username,
      email: userProfile.email,
    });
    setShowEditModal(true);
  };

  const handleEditInput = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.username.trim() || !formData.email.trim()) {
      alert("Todos los campos son obligatorios");
      return;
    }
    const oldData = { ...userProfile }; 
    showLoader("Actualizando...");
    try {
      const res = await fetch(
        `http://localhost:3000/api/auth/${userProfile._id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            email: formData.email,
            cardId: userProfile.cardId || "",
          }),
        }
      );
      const data = await res.json();
      hideLoader();
      if (res.ok) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("user")),
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            email: formData.email,
          })
        );
        setUserProfile((u) => ({
          ...u,
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
        }));
        setShowEditModal(false);
        // Mostrar alerta de cambios
        setChangesAlert({
          oldData,
          newData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            email: formData.email,
            role: userProfile.role,
            cardId: cardUID,
          }
        });
      } else {
        alert(data.message || "No se pudo actualizar el usuario.");
      }
    } catch (err) {
      hideLoader();
      alert("Ocurrió un error al actualizar.");
    }
  };

  // LOGOUT CON LOADER
  const handleLogout = () => {
    showLoader("Cerrando sesión...");
    setTimeout(() => {
      localStorage.removeItem("role");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      hideLoader();
      window.location.href = "/";
    }, 1200);
  };

  // Botón de editar 
  const EditButton = (
    <button
      onClick={openEditUserModal}
      className={styles.botonEditarRedondo}
      title="Editar datos de usuario"
    >
      <FaUserEdit style={{ color: "#fff", fontSize: 18 }} />
    </button>
  );

  // Mostrar alerta de cambios
  if (changesAlert) {
    return (
      <UserChangesAlert
        oldData={changesAlert.oldData}
        newData={changesAlert.newData}
        onClose={() => setChangesAlert(null)}
      />
    );
  }

  return (
    <div className={styles.containerPrincipal}>
      <NavigationMenu userType="user" onLogoutClick={() => setShowLogout(true)} />
      <div className={styles.contenidoConMargen}>
        <section className={styles.seccionPrincipal}>
          <div className={styles.contenedorPrincipal}>
            {/*CABECERA DINÁMICA DE USUARIO */}
            <div className={styles.contenidoPrincipal}>
              <div className={styles.perfilUsuario}>
                <div className={styles.avatarPerfil}>
                  <img
                    className={styles.avatarPerfil}
                    src={userfoto2} 
                    alt={`${userProfile.firstName} ${userProfile.lastName} - usuario`}
                  />
                </div>
                <div className={styles.informacionPerfil}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <h1>
                      ¡Hola, {userProfile.firstName} {userProfile.lastName}!
                    </h1>
                    <span
                      className={
                        userProfile.role === "Administrador"
                          ? styles.badgeAdministrador
                          : styles.badgeDocente
                      }
                    >
                      {userProfile.role.toUpperCase()}
                    </span>
                    {EditButton}
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
              {/* Sección de accesos recientes */}
              <div className={styles.accesosRecientes}>
                <div className={styles.encabezadoAccesos}>
                  <h2 className={styles.tituloAccesos}>Accesos Recientes</h2>
                </div>
                <div className={styles.listaAccesos}>
                  {recentAccesses.map((access) => (
                    <div key={access.id} className={styles.itemAcceso}>
                      <div className={styles.iconoAccesoItem}>{access.icon}</div>
                      <div className={styles.infoAcceso}>
                        <h3 className={styles.nombreAcceso}>{access.location}</h3>
                        <p className={styles.fechaAcceso}>{access.date}</p>
                        <p className={styles.horaAcceso}>{access.time}</p>
                      </div>
                      <div className={styles.estadoAcceso}>
                        <span
                          className={`${styles.estadoBadge} ${
                            access.status === "success"
                              ? styles.estadoExito
                              : styles.estadoError
                          }`}
                        >
                          {access.status === "success" ? "Permitido" : "Denegado"}
                        </span>
                        <button
                          className={styles.botonDetalles}
                          onClick={() => handleShowDetails(access)}
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Panel visual de candado y estadísticas */}
            <div className={styles.visualPrincipal}>
              <div className={styles.panelControl}>
                <div className={styles.patronTecnologico}></div>
                <div className={styles.encabezadoPanel}>
                  <h3 className={styles.tituloPanel}>Panel de Control</h3>
                  <p className={styles.subtituloPanel}>Gestiona tu acceso</p>
                </div>
                <div className={styles.contenedorCandado}>
                  <img
                    src={candado}
                    alt="Candado de seguridad"
                    className={styles.candadoImagen}
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              </div>
              <div className={styles.estadisticasPanel}>
                <h2 className={styles.tituloEstadisticas}>Resumen de Accesos</h2>
                <div className={styles.estadisticasGrid}>
                  <div className={styles.estadisticaItem}>
                    <div
                      className={styles.estadisticaIcono}
                      style={{ background: "linear-gradient(135deg, #4CAF50, #66BB6A)" }}
                    >
                      <GiDoorHandle />
                    </div>
                    <div className={styles.estadisticaTexto}>
                      <span className={styles.estadisticaNumero} style={{ color: "#4CAF50" }}>
                        {totalAllowed}
                      </span>
                      <span className={styles.estadisticaLabel}>Permitidos</span>
                    </div>
                  </div>
                  <div className={styles.estadisticaItem}>
                    <div
                      className={styles.estadisticaIcono}
                      style={{ background: "linear-gradient(135deg, #F44336, #E57373)" }}
                    >
                      <GiDoorHandle />
                    </div>
                    <div className={styles.estadisticaTexto}>
                      <span className={styles.estadisticaNumero} style={{ color: "#F44336" }}>
                        {totalDenied}
                      </span>
                      <span className={styles.estadisticaLabel}>Denegados</span>
                    </div>
                  </div>
                  <div className={styles.estadisticaItem}>
                    <div
                      className={styles.estadisticaIcono}
                      style={{
                        background: "linear-gradient(135deg, var(--color-cobre-acento), var(--color-dorado-acento))",
                      }}
                    >
                      <GiDoorHandle />
                    </div>
                    <div className={styles.estadisticaTexto}>
                      <span className={styles.estadisticaNumero} style={{ color: "var(--color-cobre-acento)" }}>
                        {totalAccesses}
                      </span>
                      <span className={styles.estadisticaLabel}>Total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ...Fin de grid */}
          </div>
        </section>
      </div>

      {/* Modal para detalles del acceso */}
      {modalVisible && (
        <div className={styles.modalOverlay} onClick={() => setModalVisible(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={() => setModalVisible(false)}>
              ×
            </button>
            {selectedAccess && (
              <div className={styles.modalBody}>
                <div className={styles.modalIcono}>
                  <GiDoorHandle />
                </div>
                <h3 className={styles.modalTitulo}>{selectedAccess.location}</h3>
                <div className={styles.modalDetalles}>
                  <div className={styles.modalDetalle}>
                    <span className={styles.modalEtiqueta}>Fecha:</span>
                    <span className={styles.modalValor}>{selectedAccess.date}</span>
                  </div>
                  <div className={styles.modalDetalle}>
                    <span className={styles.modalEtiqueta}>Hora:</span>
                    <span className={styles.modalValor}>{selectedAccess.time}</span>
                  </div>
                  <div className={styles.modalDetalle}>
                    <span className={styles.modalEtiqueta}>Estado:</span>
                    <span
                      className={`${styles.modalValor} ${
                        selectedAccess.status === "success"
                          ? styles.modalExito
                          : styles.modalError
                      }`}
                    >
                      {selectedAccess.status === "success"
                        ? "Acceso Permitido"
                        : "Acceso Denegado"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/*MODAL EDICIÓN DE USUARIO*/}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentForm} style={{ maxWidth: 480 }}>
            <button className={styles.modalCloseButton} onClick={() => setShowEditModal(false)}>
              ×
            </button>
            <h2
              style={{
                fontSize: "2rem",
                textAlign: "center",
                color: "#5D4037",
                marginBottom: "22px",
                fontWeight: 700,
              }}
            >
              Editar datos de usuario
            </h2>
            <form onSubmit={handleEditSubmit} className={styles.formEditUser}>
              <div>
                <label className={styles.etiquetaCampo}>Nombre(s)</label>
                <input
                  className={styles.input}
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleEditInput}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className={styles.etiquetaCampo}>Apellidos</label>
                <input
                  className={styles.input}
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleEditInput}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className={styles.etiquetaCampo}>Nombre de usuario</label>
                <input
                  className={styles.input}
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleEditInput}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className={styles.etiquetaCampo}>Correo electrónico</label>
                <input
                  className={styles.input}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleEditInput}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className={styles.etiquetaCampo}>Tarjeta asignada</label>
                <input
                  className={styles.input}
                  type="text"
                  value={cardUID}
                  disabled
                  style={{ background: "#f4ede3" }}
                  placeholder="Sin tarjeta asignada"
                />
              </div>
              <div className={styles.formButtons}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSave}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de logout */}
      <ModalLogout
        visible={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
