import React, { useState, useEffect } from "react";
import NavigationMenu from "../../components/Navigation/NavigationMenu";
import userfoto2 from "../../assets/icons/userfoto2.png";
import { GiDoorHandle } from "react-icons/gi";
import candado from "../../assets/logos/candado.png";
import styles from "./UserHomeScreen.module.css";
import ModalLogout from "../../components/logout/ModalLogout";
import { FaUserEdit } from "react-icons/fa";

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

  // DEMO Accesos recientes (simulación)
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

  // -------- MODAL EDICIÓN DE USUARIO --------
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
          }),
        }
      );
      const data = await res.json();
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
      } else {
        alert(data.message || "No se pudo actualizar el usuario.");
      }
    } catch (err) {
      alert("Ocurrió un error al actualizar.");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Botón de editar (redondo, gradiente, icono pro)
  const EditButton = (
    <button
      onClick={openEditUserModal}
      className={styles.botonEditarRedondo}
      title="Editar datos de usuario"
    >
      <FaUserEdit style={{ color: "#fff", fontSize: 18 }} />
    </button>
  );

  return (
    <div className={styles.containerPrincipal}>
      <NavigationMenu userType="user" onLogoutClick={() => setShowLogout(true)} />
      <div className={styles.contenidoConMargen}>
        <section className={styles.seccionPrincipal}>
          <div className={styles.contenedorPrincipal}>
            {/* --------- CABECERA DINÁMICA DE USUARIO --------- */}
            <div className={styles.contenidoPrincipal}>
              <div className={styles.perfilUsuario}>
                <div className={styles.avatarPerfil}>
                  <img
                    className={styles.avatarPerfil}
                    src={userProfile.foto}
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
                  <div className={styles.imagenCandado}>
                    <img
                      src={candado}
                      alt="Candado de seguridad"
                      className={styles.candadoImagen}
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
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

      {/* -------- MODAL EDICIÓN DE USUARIO (ESTILO ADMIN) -------- */}
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
