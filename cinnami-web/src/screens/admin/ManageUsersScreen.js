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

const initialFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Docente',
  names: '',
  surnames: '',
  uid: '', // _id de la tarjeta seleccionada
};

export default function ManageUsersScreen({ onLogoutClick }) {
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
  const [selectedUser, setSelectedUser] = useState(null);

  // FUNCION CENTRAL PARA TRAER USUARIOS REALES
  const loadUsers = () => {
    fetch('http://localhost:3000/api/auth/all-users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);
      })
      .catch(() => {
        setUsers([]);
        setFilteredUsers([]);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Paginación
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

  // Filtrar usuarios
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

  // Cargar tarjetas disponibles SOLO cuando abres el modal de registro/edición
  useEffect(() => {
    if (showModal) {
      fetch('http://localhost:3000/api/auth/cards/available', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setAvailableCards(data.cards || []))
        .catch(() => setAvailableCards([]));
    }
  }, [showModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => setFormData(prev => ({ ...prev, role }));

  // Validación simple
  const validateForm = () => {
    if (!formData.username.trim()) return alert('Por favor ingrese un nombre de usuario');
    if (!formData.email.trim()) return alert('Por favor ingrese un email válido');
    if (!formData.names.trim()) return alert('Por favor ingrese el nombre(s)');
    if (!formData.surnames.trim()) return alert('Por favor ingrese los apellidos');
    if (!formData.uid) return alert('Por favor selecciona una tarjeta');
    if (modalType === 'add' && formData.password !== formData.confirmPassword) return alert('Las contraseñas no coinciden');
    if (modalType === 'add' && !formData.password.trim()) return alert('Por favor ingrese una contraseña');
    return true;
  };

  // SUBMIT: Crear usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (modalType === 'add') {
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
          closeModal();
          loadUsers(); // Vuelve a cargar la lista real
        } else {
          alert(data.message || 'No se pudo crear el usuario');
        }
      } catch (err) {
        alert('Error al crear usuario');
      }
    }
    // Si implementas edición, aquí iría el fetch correspondiente
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

  // Modal detalle usuario
  const closeUserDetailModal = () => setSelectedUser(null);

  // Habilitar/deshabilitar usuario
  const handleDisableUser = async (user) => {
    try {
      const url = user.status
        ? `http://localhost:3000/api/auth/${user._id}/disable`
        : `http://localhost:3000/api/auth/${user._id}/enable`;
      await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      closeUserDetailModal();
      loadUsers();
    } catch (err) {
      alert('Error al cambiar el estado del usuario');
    }
  };

  // Editar usuario (ejemplo simple: llena el form y abre modal)
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

  // Paginación
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

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
                  <div className={styles.userActions}>
                    {/* Opciones rápidas si quieres */}
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
                  <div className={styles.passwordContainer}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={styles.input}
                      placeholder="Contraseña"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={modalType === 'add'}
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
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
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

      {/* Modal detalle de usuario al hacer click en tarjeta */}
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
                  <p><b>Tarjeta asignada:</b> {selectedUser.cardId || '-'}</p>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.saveButton} onClick={() => handleEditUser(selectedUser)}>
                  Editar
                </button>
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

    </div>
  );
}
