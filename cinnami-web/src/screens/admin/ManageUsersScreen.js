import React, { useState, useEffect } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import styles from './ManageUsersScreen.module.css';
import globalstyles from '../../styles/globalStyles.module.css';
import {
  FaSave,
  FaTimes,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useLoader } from "../../context/LoaderContext"; // <--- LOADER GLOBAL

// MODAL DE CAMBIO DE USUARIO
function ChangesAlert({ oldData, newData, allCards, onClose }) {
  const prettyLabel = {
    username: 'Usuario',
    email: 'Email',
    password: 'Contraseña',
    role: 'Rol',
    firstName: 'Nombre(s)',
    lastName: 'Apellido(s)',
    cardId: 'Tarjeta'
  };
  const changedFields = [];
  Object.keys(newData).forEach(key => {
    if (key === "password") {
      if (newData[key]) {
        changedFields.push(
          <tr key={key}>
            <td>{prettyLabel[key]}</td>
            <td>-</td>
            <td>******</td>
          </tr>
        );
      }
    } else if (key === "cardId") {
      if ((oldData.cardId || '') !== (newData.cardId || '')) {
        const oldCard = allCards.find(c => c._id === oldData.cardId);
        const newCard = allCards.find(c => c._id === newData.cardId);
        changedFields.push(
          <tr key={key}>
            <td>{prettyLabel[key]}</td>
            <td>{oldCard ? oldCard.uid : 'Sin asignar'}</td>
            <td>{newCard ? newCard.uid : 'Sin asignar'}</td>
          </tr>
        );
      }
    } else {
      if ((oldData[key] || '') !== (newData[key] || '')) {
        changedFields.push(
          <tr key={key}>
            <td>{prettyLabel[key] || key}</td>
            <td>{oldData[key] || '-'}</td>
            <td>{newData[key] || '-'}</td>
          </tr>
        );
      }
    }
  });
  if (changedFields.length === 0) {
    changedFields.push(
      <tr key="nochange">
        <td colSpan={3} style={{ color: '#999', fontStyle: 'italic', padding: 10 }}>No hubo cambios.</td>
      </tr>
    );
  }
  return (
    <div className={styles.changesModalOverlay}>
      <div className={styles.changesModalContent}>
        <h3><span className={styles.iconCheck}>✔️</span> Usuario actualizado</h3>
        <div style={{ color: '#695c5c', marginBottom: '0.6rem', fontSize: '1em' }}>
          Estos campos cambiaron:
        </div>
        <table className={styles.changesTable}>
          <thead>
            <tr>
              <th>Campo</th>
              <th>Antes</th>
              <th>Después</th>
            </tr>
          </thead>
          <tbody>{changedFields}</tbody>
        </table>
        <button className={styles.closeButton} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// MODAL DE CONFIRMACIÓN VISUAL
function ConfirmDisableModal({ visible, user, onCancel, onConfirm }) {
  if (!visible || !user) return null;
  return (
    <div className={styles.confirmModalOverlay}>
      <div className={styles.confirmModalContent}>
        <h2 className={styles.confirmTitle}>
          {user.status ? 'Deshabilitar usuario' : 'Habilitar usuario'}
        </h2>
        <div className={styles.confirmText}>
          ¿Estás seguro de que deseas <b className={user.status ? styles.inactivoText : styles.activoText}>
            {user.status ? 'deshabilitar' : 'habilitar'}
          </b> al usuario <b className={styles.nombreUsuario}>{user.firstName} {user.lastName}</b>?
        </div>
        <div className={styles.confirmActions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={user.status ? styles.disableUserButton : styles.enableUserButton}
            style={{ minWidth: 120, fontWeight: 700, fontSize: 15, letterSpacing: '.5px', border: 'none' }}
            onClick={() => onConfirm(user)}
          >
            {user.status ? 'Deshabilitar' : 'Habilitar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const initialFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Docente',
  names: '',
  surnames: '',
  uid: '',
};

export default function ManageUsersScreen({ onLogoutClick }) {
  const { showLoader, hideLoader } = useLoader();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingUser, setEditingUser] = useState(null);
  const [availableCards, setAvailableCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [changesAlert, setChangesAlert] = useState(null);

  const [confirmDisableModal, setConfirmDisableModal] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);

  // --- Carga usuarios y tarjetas (con loader) ---
  const loadUsers = async () => {
    showLoader("Cargando usuarios...");
    try {
      const res = await fetch('http://localhost:3000/api/auth/all-users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch {
      setUsers([]);
      setFilteredUsers([]);
    }
    hideLoader();
  };

  const loadAllCards = async () => {
    showLoader("Cargando tarjetas...");
    try {
      const res = await fetch('http://localhost:3000/api/auth/cards', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAllCards(data.cards || []);
    } catch {
      setAllCards([]);
    }
    hideLoader();
  };

  useEffect(() => {
    loadUsers();
    loadAllCards();
    // eslint-disable-next-line
  }, []);

  // Paginación y filtros (igual)
  const getUsersPerPage = () => window.innerWidth >= 1400 ? 9 : window.innerWidth >= 1024 ? 6 : 5;
  const [usersPerPage, setUsersPerPage] = useState(getUsersPerPage());
  useEffect(() => {
    const handleResize = () => {
      setUsersPerPage(getUsersPerPage());
      setCurrentPage(1);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm]);

  useEffect(() => {
    if (showModal) {
      showLoader("Cargando tarjetas disponibles...");
      fetch('http://localhost:3000/api/auth/cards/available', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setAvailableCards(data.cards || []))
        .catch(() => setAvailableCards([]))
        .finally(() => hideLoader());
    }
    // eslint-disable-next-line
  }, [showModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => setFormData(prev => ({ ...prev, role }));

  // -------- Validación modificada ----------
  const validateForm = () => {
    if (!formData.username.trim()) return alert('Por favor ingrese un nombre de usuario');
    if (!formData.email.trim()) return alert('Por favor ingrese un email válido');
    if (!formData.names.trim()) return alert('Por favor ingrese el nombre(s)');
    if (!formData.surnames.trim()) return alert('Por favor ingrese los apellidos');
    if (!formData.uid) return alert('Por favor selecciona una tarjeta');
    // Solo pedir contraseña si es agregar
    if (modalType === 'add') {
      if (!formData.password.trim() || !formData.confirmPassword.trim())
        return alert('Debe ingresar y confirmar la contraseña');
      if (formData.password !== formData.confirmPassword)
        return alert('Las contraseñas no coinciden');
    }
    return true;
  };

  function getCardUID(cardId) {
    if (!cardId) return "Sin asignar";
    const card = allCards.find(c => c._id === cardId);
    return card ? card.uid : "Sin asignar";
  }

  // -------- Submit con loader y sin edición de contraseña ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (modalType === 'add') {
      showLoader("Agregando usuario...");
      try {
        const userPayload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role.toLowerCase(),
          firstName: formData.names,
          lastName: formData.surnames,
          cardId: formData.uid
        };
        const res = await fetch('http://localhost:3000/api/auth/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(userPayload)
        });
        const data = await res.json();
        if (res.ok) {
          // Asignar tarjeta
          const userId = data.user._id || data.user.id;
          const cardId = data.user.cardId;
          if (userId && cardId) {
            await fetch(`http://localhost:3000/api/auth/cards/${cardId}/assign`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ userId })
            });
          }
          toast.success(
            <div style={{ fontWeight: 800, fontSize: '1.18rem', color: '#9C640C', textAlign: 'center', letterSpacing: '.7px' }}>
              Usuario agregado exitosamente
              <div style={{ fontSize: '1.03rem', color: '#53381A', fontWeight: 400, marginTop: 2 }}>
                El usuario ya puede usar su tarjeta física.
              </div>
            </div>,
            {
              style: {
                background: '#FFF5DF',
                color: '#53381A',
                fontWeight: 700,
                borderRadius: '14px',
                fontSize: '1.12rem',
                minWidth: 350,
                maxWidth: 450,
                minHeight: 50,
                padding: '16px 26px',
                border: '1.5px solid #E0A92F',
                boxShadow: '0 4px 16px 0 rgba(224,169,47,0.10)'
              },
              icon: false,
              autoClose: 3800,
              closeButton: true,
              pauseOnHover: true
            }
          );
          closeModal();
          await loadUsers();
          await loadAllCards();
        } else {
          alert(data.message || 'No se pudo crear el usuario');
        }
      } catch (err) {
        alert('Error al crear usuario');
      }
      hideLoader();
    } else if (modalType === 'edit' && editingUser) {
      showLoader("Actualizando usuario...");
      try {
        const userId = editingUser._id || editingUser.id;
        const userPayload = {
          username: formData.username,
          email: formData.email,
          role: formData.role.toLowerCase(),
          firstName: formData.names,
          lastName: formData.surnames,
          cardId: formData.uid
        };
        const res = await fetch(`http://localhost:3000/api/auth/${userId}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(userPayload)
        });
        const data = await res.json();

        if (res.ok) {
          if (editingUser.cardId && editingUser.cardId !== formData.uid) {
            await fetch(`http://localhost:3000/api/auth/cards/${editingUser.cardId}/assign`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ userId: null })
            });
          }
          if (formData.uid && editingUser.cardId !== formData.uid) {
            await fetch(`http://localhost:3000/api/auth/cards/${formData.uid}/assign`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ userId })
            });
          }
          closeModal();
          await loadUsers();
          await loadAllCards();
          setChangesAlert({
            oldData: editingUser,
            newData: {
              username: formData.username,
              email: formData.email,
              role: formData.role,
              firstName: formData.names,
              lastName: formData.surnames,
              cardId: formData.uid
            }
          });
        } else {
          alert(data.message || 'No se pudo actualizar el usuario');
        }
      } catch (err) {
        alert('Error al actualizar usuario');
      }
      hideLoader();
    }
  };

  const openAddModal = () => {
    setModalType('add');
    setFormData(initialFormData);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('add');
    setEditingUser(null);
    setFormData(initialFormData);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const closeUserDetailModal = () => setSelectedUser(null);

  // NUEVO: Muestra modal confirmación y setea usuario
  const handleDisableUser = (user) => {
    setUserToDisable(user);
    setConfirmDisableModal(true);
  };

  // NUEVO: Lógica solo si confirman
  const confirmDisableUser = async (user) => {
    setConfirmDisableModal(false);
    setUserToDisable(null);
    showLoader(user.status ? "Deshabilitando usuario..." : "Habilitando usuario...");
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Inicia sesión nuevamente");
        window.location.href = '/';
        hideLoader();
        return;
      }
      const url = user.status
        ? `http://localhost:3000/api/auth/${user._id}/disable`
        : `http://localhost:3000/api/auth/${user._id}/enable`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        let msg = "No se pudo cambiar el estado del usuario.";
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch { }
        if (res.status === 403) {
          toast.error("No tienes permisos para esta acción. Debes iniciar sesión como admin.");
          window.location.href = '/';
          hideLoader();
          return;
        }
        toast.error(msg);
        hideLoader();
        return;
      }

      closeUserDetailModal();
      await loadUsers();
      await loadAllCards();
      toast.success(
        <div style={{
          fontWeight: 800,
          fontSize: '1.16rem',
          color: user.status ? '#F44336' : '#28A745',
          textAlign: 'center',
          letterSpacing: '.7px'
        }}>
          {user.status ? 'Usuario deshabilitado' : 'Usuario habilitado'}
        </div>,
        {
          style: {
            background: user.status ? '#FFF0F0' : '#E6F7EE',
            color: 'var(--colorCafePrincipal)',
            fontWeight: 700,
            borderRadius: '14px',
            fontSize: '1.12rem',
            minWidth: 320,
            maxWidth: 400,
            minHeight: 45,
            padding: '16px 26px',
            border: user.status ? '1.5px solid #F44336' : '1.5px solid #28A745',
            boxShadow: '0 4px 16px 0 rgba(52,100,44,0.10)'
          },
          icon: false,
          autoClose: 3600,
          closeButton: true,
          pauseOnHover: true
        }
      );
    } catch (err) {
      toast.error('Error al cambiar el estado del usuario');
    }
    hideLoader();
  };

  const handleEditUser = (user) => {
    setModalType('edit');
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      role: user.role === 'admin' ? 'Admin' : 'Docente',
      names: user.firstName || '',
      surnames: user.lastName || '',
      uid: user.cardId || '',
    });
    setShowModal(true);
    setSelectedUser(null);
  };

  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  if (changesAlert) {
    return (
      <ChangesAlert
        oldData={changesAlert.oldData}
        newData={changesAlert.newData}
        allCards={allCards}
        onClose={() => setChangesAlert(null)}
      />
    );
  }

  return (
    <div className={styles.containerPrincipal}>
      <div className={styles.container}>
        <NavigationMenu userType="admin" onLogoutClick={onLogoutClick} />
        <div className={styles.mainContent}>
          <header className={globalstyles.header}>
            <h1 className={globalstyles.title}>Administración de usuarios</h1>
          </header>
          <div className={styles.panel}>
            <div className={styles.searchBar}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar por usuario, correo, nombre o apellidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className={styles.searchIcon}><FaSearch /></span>
            </div>
            <div className={styles.addButtonContainer}>
              <button onClick={openAddModal} className={styles.addButton}>
                <FaPlus style={{ marginRight: '8px' }} />
                Agregar nuevo usuario
              </button>
            </div>
            <div className={styles.usersGrid}>
              {currentUsers.map(user => (
                <div
                  key={user._id || user.id}
                  className={styles.userCard}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{user.firstName} {user.lastName}</h3>
                    <div className={styles.userDetails}>
                      <p>Usuario: {user.username}</p>
                      <p>Email: {user.email}</p>
                      <p>Rol: <span className={`${styles.roleBadge} ${styles[user.role?.toLowerCase()]}`}>{user.role}</span></p>
                      <p>Estado: <span className={user.status ? styles.estadoBadge + ' ' + styles.activo : styles.estadoBadge + ' ' + styles.inactivo}>{user.status ? "Activo" : "Inactivo"}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.newPaginationContainer}>
                <button className={styles.paginationButton} onClick={handlePreviousPage} disabled={currentPage === 1}>
                  <FaArrowLeft />
                  Anterior
                </button>
                <div className={styles.pageIndicator}>Página {currentPage} de {totalPages}</div>
                <button className={styles.paginationButton} onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Siguiente
                  <FaArrowRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar usuario */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{modalType === 'add' ? 'Agregar nuevo usuario' : 'Editar usuario'}</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formColumn}>
                  <input
                    type="text"
                    name="username"
                    className={styles.input}
                    placeholder="Nombre de usuario"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    className={styles.input}
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="names"
                    className={styles.input}
                    placeholder="Nombre(s)"
                    value={formData.names}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="surnames"
                    className={styles.input}
                    placeholder="Apellido(s)"
                    value={formData.surnames}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formColumn}>
                  {/* SOLO si es agregar usuario, pide contraseña */}
                  {modalType === 'add' && (
                    <>
                      <div className={styles.passwordContainer}>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className={styles.input}
                          placeholder="Contraseña"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={modalType === 'add'}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <div className={styles.passwordContainer}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          className={styles.input}
                          placeholder="Confirmar contraseña"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required={modalType === 'add'}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </>
                  )}
                  {/* Selector de tarjetas disponibles */}
                  <select
                    name="uid"
                    className={styles.input}
                    value={formData.uid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona una tarjeta disponible</option>
                    {availableCards.map(card =>
                      <option key={card._id} value={card._id}>{card.uid}</option>
                    )}
                    {/* Mostrar también la tarjeta ya asignada si está editando */}
                    {modalType === "edit" && formData.uid && !availableCards.some(card => card._id === formData.uid) && (
                      <option value={formData.uid}>
                        {getCardUID(formData.uid)}
                      </option>
                    )}
                  </select>
                  {/* Selector de rol */}
                  <div className={styles.roleSelector} style={{ marginTop: 18 }}>
                    <label className={styles.roleLabel}>Rol:</label>
                    <div className={styles.roleButtons}>
                      {['Docente', 'Admin'].map(role => (
                        <button
                          key={role}
                          type="button"
                          className={`${styles.roleButton} ${formData.role === role ? styles.active : ''}`}
                          onClick={() => handleRoleSelect(role)}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton}>
                  <FaSave style={{ marginRight: '6px' }} />
                  Guardar
                </button>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  <FaTimes style={{ marginRight: '6px' }} />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle de usuario */}
      {selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalle de usuario</h2>
              <button className={styles.closeButton} onClick={closeUserDetailModal}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formColumn}>
                  <p><b>Nombre(s):</b> {selectedUser.firstName}</p>
                  <p><b>Apellido(s):</b> {selectedUser.lastName}</p>
                  <p><b>Usuario:</b> {selectedUser.username}</p>
                  <p><b>Email:</b> {selectedUser.email}</p>
                  <p><b>Rol:</b> <span className={`${styles.roleBadge} ${styles[selectedUser.role?.toLowerCase()]}`}>{selectedUser.role}</span></p>
                  <p><b>Estado:</b> <span className={selectedUser.status ? styles.estadoBadge + ' ' + styles.activo : styles.estadoBadge + ' ' + styles.inactivo}>{selectedUser.status ? "Activo" : "Inactivo"}</span></p>
                  <p><b>Tarjeta asignada:</b> {getCardUID(selectedUser.cardId)}</p>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.saveButton} onClick={() => handleEditUser(selectedUser)}>
                  Editar
                </button>
                {/* Botón para deshabilitar/habilitar */}
                <button
                  className={selectedUser.status ? styles.disableUserButton : styles.enableUserButton}
                  onClick={() => handleDisableUser(selectedUser)}
                >
                  {selectedUser.status ? "Deshabilitar" : "Habilitar"}
                </button>
                <button className={styles.cancelButton} onClick={closeUserDetailModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- Modal de confirmación --- */}
      <ConfirmDisableModal
        visible={confirmDisableModal}
        user={userToDisable}
        onCancel={() => { setConfirmDisableModal(false); setUserToDisable(null); }}
        onConfirm={confirmDisableUser}
      />
    </div>
  );
}
