import React, { useState, useEffect, useCallback } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import styles from './ManageCardsScreen.module.css';
import globalstyles from '../../styles/globalStyles.module.css';
import { toast } from 'react-toastify';

// MODAL DE CONFIRMACIÓN CON COLORES CÁLIDOS
function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10002,
      background: 'rgba(224,169,47,0.13)', // dorado translúcido
      display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff9f2',      // beige cálido
        color: '#53381A',           // café oscuro
        padding: '34px 36px 30px 36px',
        borderRadius: 18,
        boxShadow: '0 8px 40px 0 rgba(224,169,47,0.14)', // sombra dorada
        minWidth: 340, maxWidth: '98vw',
        textAlign: 'center',
        animation: 'fadeInScale .23s'
      }}>
        <h3 style={{
          fontSize: '1.17rem', fontWeight: 'bold', marginBottom: 15,
          color: '#E0A92F', letterSpacing: '.2px'
        }}>{title || 'Confirmar acción'}</h3>
        <p style={{
          fontSize: '1.09rem', color: '#7b5c26', marginBottom: 22
        }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
          <button
            onClick={onCancel}
            style={{
              background: '#f7e6c6', color: '#8c6c2e', border: '1.6px solid #E0A92F',
              borderRadius: 12, fontSize: '1.08rem', fontWeight: 600,
              padding: '10px 22px', cursor: 'pointer', transition: '.13s'
            }}>Cancelar</button>
          <button
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(90deg,#e9c974 35%,#e0a92f 100%)',
              color: '#fff', fontWeight: 700, border: 'none', borderRadius: 12,
              fontSize: '1.09rem', padding: '10px 28px', cursor: 'pointer',
              boxShadow: '0 3px 16px 0 rgba(224,169,47,0.13)'
            }}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}

export default function ManageCardsScreen({ onLogoutClick }) {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ cardId: '' });

  // Confirmación visual para acciones destructivas
  const [confirm, setConfirm] = useState({ open: false, type: '', cardId: null, cardState: null });

  const getToken = () => localStorage.getItem('token');

  const fetchCards = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch('http://localhost:3000/api/auth/cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCards(data.cards || []);
        setFilteredCards(data.cards || []);
      } else {
        toast.error(data.message || 'No se pudieron obtener las tarjetas', {
          style: {
            background: '#FFEBEE',
            color: '#8b0000',
            fontWeight: 500,
            borderRadius: '13px',
            fontSize: '1.08rem',
            minWidth: 310,
            maxWidth: 420,
            padding: '17px 20px'
          }
        });
      }
    } catch (err) {
      toast.error('Error de red o del servidor', {
        style: {
          background: '#FFEBEE',
          color: '#8b0000',
          fontWeight: 500,
          borderRadius: '13px',
          fontSize: '1.08rem',
          minWidth: 310,
          maxWidth: 420,
          padding: '17px 20px'
        }
      });
      setCards([]);
      setFilteredCards([]);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  useEffect(() => {
    const filtered = cards.filter(card =>
      card.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.assignedTo?.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [searchTerm, cards]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  // En vez de window.confirm, abrimos modal
  const askDeleteCard = (cardId) => setConfirm({ open: true, type: 'delete', cardId });
  const askToggleCard = (cardId, state) => setConfirm({ open: true, type: state ? 'block' : 'unblock', cardId, cardState: state });

  // Cuando el usuario confirma en el modal
  const handleConfirm = async () => {
    if (confirm.type === 'delete') await deleteCard(confirm.cardId);
    else if (confirm.type === 'block' || confirm.type === 'unblock') await toggleCardStatus(confirm.cardId, confirm.cardState);
    setConfirm({ open: false, type: '', cardId: null, cardState: null });
  };
  const handleCancel = () => setConfirm({ open: false, type: '', cardId: null, cardState: null });

  // Bloquear/desbloquear tarjeta
  const toggleCardStatus = async (cardId, state) => {
    const action = state ? 'bloquear' : 'desbloquear';
    try {
      const token = getToken();
      const url = state
        ? `http://localhost:3000/api/auth/cards/${cardId}/disable`
        : `http://localhost:3000/api/auth/cards/${cardId}/enable`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          <div style={{
            fontWeight: 700,
            color: '#8D6105',
            fontSize: '1.13rem',
            letterSpacing: '0.1px',
            textAlign: 'center'
          }}>
            {action === 'bloquear' ? 'Tarjeta bloqueada exitosamente' : 'Tarjeta desbloqueada exitosamente'}
          </div>,
          {
            style: {
              background: '#FCF3DF',
              color: '#53381A',
              fontWeight: 700,
              borderRadius: '14px',
              fontSize: '1.13rem',
              minWidth: 350,
              maxWidth: 450,
              minHeight: 42,
              padding: '16px 26px',
              border: '1.5px solid #E0A92F',
              boxShadow: '0 4px 16px 0 rgba(224,169,47,0.10)'
            },
            icon: false,
            autoClose: 3300
          }
        );
        fetchCards();
      } else {
        toast.error(data.message || 'No se pudo cambiar el estado', {
          style: {
            background: '#FFEBEE',
            color: '#8b0000',
            fontWeight: 500,
            borderRadius: '13px',
            fontSize: '1.08rem',
            minWidth: 310,
            maxWidth: 420,
            padding: '17px 20px'
          }
        });
      }
    } catch (err) {
      toast.error('Error al cambiar el estado', {
        style: {
          background: '#FFEBEE',
          color: '#8b0000',
          fontWeight: 500,
          borderRadius: '13px',
          fontSize: '1.08rem',
          minWidth: 310,
          maxWidth: 420,
          padding: '17px 20px'
        }
      });
    }
  };

  // Eliminar tarjeta
  const deleteCard = async (cardId) => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3000/api/auth/cards/${cardId}/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          <div style={{
            fontWeight: 700,
            color: '#8D6105',
            fontSize: '1.13rem',
            textAlign: 'center'
          }}>
            Tarjeta eliminada exitosamente
          </div>,
          {
            style: {
              background: '#FCF3DF',
              color: '#53381A',
              fontWeight: 700,
              borderRadius: '14px',
              fontSize: '1.13rem',
              minWidth: 350,
              maxWidth: 450,
              minHeight: 42,
              padding: '16px 26px',
              border: '1.5px solid #E0A92F',
              boxShadow: '0 4px 16px 0 rgba(224,169,47,0.10)'
            },
            icon: false,
            autoClose: 3400
          }
        );
        fetchCards();
      } else {
        toast.error(data.message || 'No se pudo eliminar la tarjeta', {
          style: {
            background: '#FFEBEE',
            color: '#8b0000',
            fontWeight: 500,
            borderRadius: '13px',
            fontSize: '1.08rem',
            minWidth: 310,
            maxWidth: 420,
            padding: '17px 20px'
          }
        });
      }
    } catch (err) {
      toast.error('Error al eliminar la tarjeta', {
        style: {
          background: '#FFEBEE',
          color: '#8b0000',
          fontWeight: 500,
          borderRadius: '13px',
          fontSize: '1.08rem',
          minWidth: 310,
          maxWidth: 420,
          padding: '17px 20px'
        }
      });
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewCard({ cardId: '' });
  };

  const saveCard = async () => {
    if (!newCard.cardId.trim()) {
      toast.info('Por favor, ingrese el ID de la tarjeta.', {
        style: {
          background: '#FFF8E1',
          color: '#53381A',
          fontWeight: 600,
          borderRadius: '12px',
          fontSize: '1.08rem',
          minWidth: 310,
          maxWidth: 420,
          padding: '17px 20px'
        }
      });
      return;
    }
    try {
      const token = getToken();
      const res = await fetch('http://localhost:3000/api/auth/addCard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uid: newCard.cardId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          <div style={{
            fontWeight: 800,
            fontSize: '1.21rem',
            color: '#9C640C',
            textAlign: 'center',
            letterSpacing: '.7px'
          }}>
            Tarjeta creada exitosamente
            <div style={{
              fontSize: '1.03rem',
              color: '#53381A',
              fontWeight: 400,
              marginTop: 2
            }}>
              Ahora puedes asignarla o usarla en el sistema.
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
            autoClose: 4200,
            closeButton: true,
            pauseOnHover: true
          }
        );
        closeModal();
        fetchCards();
      } else {
        toast.error(data.message || 'No se pudo registrar la tarjeta', {
          style: {
            background: '#FFEBEE',
            color: '#8b0000',
            fontWeight: 500,
            borderRadius: '13px',
            fontSize: '1.08rem',
            minWidth: 310,
            maxWidth: 420,
            padding: '17px 20px'
          }
        });
      }
    } catch (err) {
      toast.error('Error al registrar la tarjeta', {
        style: {
          background: '#FFEBEE',
          color: '#8b0000',
          fontWeight: 500,
          borderRadius: '13px',
          fontSize: '1.08rem',
          minWidth: 310,
          maxWidth: 420,
          padding: '17px 20px'
        }
      });
    }
  };

  const handleInputChange = (value) => setNewCard({ cardId: value });

  return (
    <div className={styles.containerPrincipal}>
      <NavigationMenu userType="admin" onLogoutClick={onLogoutClick} />
      <main className={globalstyles.contenedorPrincipal}>
        <header className={globalstyles.header}>
          <h1 className={globalstyles.title}>Gestión de tarjetas</h1>
        </header>
        <div className={styles.barraHerramientas}>
          <div className={styles.campoBusqueda}>
            <input
              type="text"
              className={styles.inputBusqueda}
              placeholder="Buscar tarjeta o usuario..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <span className={styles.iconoBusqueda}>🔍</span>
          </div>
          <button className={styles.botonRegistrar} onClick={openModal}>
            Registrar Nueva Tarjeta
          </button>
        </div>

        <div className={styles.cuadriculaTarjetas}>
          {filteredCards.map(card => (
            <div key={card._id} className={styles.tarjetaUsuario}>
              <div className={styles.patronFondo}></div>
              <div className={styles.infoTarjeta}>
                <div className={styles.codigoTarjeta}>Tarjeta: {card.uid}</div>
                <div className={styles.usuarioTarjeta}>
                  Usuario: {card.assignedTo?.username || 'Sin asignar'}
                </div>
                <span className={`${styles.estadoTarjeta} ${card.state ? styles.estadoActiva : styles.estadoBloqueada}`}>
                  Estado: {card.state ? 'Activa' : 'Bloqueada'}
                </span>
              </div>
              <div className={styles.botonesAccion}>
                <button
                  className={`${styles.botonAccion} ${card.state ? styles.botonBloquear : styles.botonDesbloquear}`}
                  onClick={() => askToggleCard(card._id, card.state)}
                >
                  {card.state ? 'Bloquear' : 'Desbloquear'}
                </button>
                <button
                  className={`${styles.botonAccion} ${styles.botonEliminar}`}
                  onClick={() => askDeleteCard(card._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal para registrar nueva tarjeta */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContenido} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitulo}>Registrar Nueva Tarjeta</h2>
            <div className={styles.grupoCampo}>
              <label className={styles.etiquetaCampo}>ID de Tarjeta</label>
              <input
                type="text"
                className={styles.campoEntrada}
                placeholder="Ej: A1B2C3"
                value={newCard.cardId}
                onChange={(e) => handleInputChange(e.target.value)}
                maxLength={10}
              />
            </div>
            <div className={styles.botonesModal}>
              <button className={styles.botonCancelar} onClick={closeModal}>
                Cancelar
              </button>
              <button className={styles.botonGuardar} onClick={saveCard}>
                Registrar Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación bonito */}
      <ConfirmModal
        open={confirm.open}
        title={
          confirm.type === 'delete'
            ? '¿Eliminar tarjeta?'
            : confirm.type === 'block'
              ? '¿Bloquear tarjeta?'
              : confirm.type === 'unblock'
                ? '¿Desbloquear tarjeta?'
                : '¿Confirmar acción?'
        }
        message={
          confirm.type === 'delete'
            ? '¿Está seguro de que desea eliminar esta tarjeta? Esta acción no se puede deshacer.'
            : confirm.type === 'block'
              ? '¿Está seguro de que desea bloquear esta tarjeta?'
              : confirm.type === 'unblock'
                ? '¿Está seguro de que desea desbloquear esta tarjeta?'
                : ''
        }
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
