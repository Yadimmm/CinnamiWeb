import React, { useState, useEffect } from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import styles from './AccessHistoryScreen.module.css';
import { GiDoorHandle } from "react-icons/gi";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import globalstyles from '../../styles/globalStyles.module.css';

export default function AccessHistoryScreen({ onLogoutClick }) {
  const [filter, setFilter] = useState('todos');
  const [accessHistory, setAccessHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Datos de ejemplo - en producción vendrían de una API
  const mockAccessData = [
    {
      id: 1,
      location: 'Puerta Principal',
      date: '15 Jun 2025',
      time: '10:30 AM',
      status: 'success',
      icon: <GiDoorHandle />
    },
    {
      id: 2,
      location: 'Puerta Secundaria',
      date: '15 Jun 2025',
      time: '09:15 AM',
      status: 'failed',
      icon: <GiDoorHandle />
    },
    {
      id: 3,
      location: 'Puerta Principal',
      date: '14 Jun 2025',
      time: '04:45 PM',
      status: 'success',
      icon: <GiDoorHandle />
    },
    {
      id: 4,
      location: 'Puerta Principal',
      date: '14 Jun 2025',
      time: '08:30 AM',
      status: 'success',
      icon: <GiDoorHandle />
    },
    {
      id: 5,
      location: 'Puerta Secundaria',
      date: '13 Jun 2025',
      time: '06:20 PM',
      status: 'success',
      icon: <GiDoorHandle />
    },
    {
      id: 6,
      location: 'Puerta Principal',
      date: '13 Jun 2025',
      time: '11:15 AM',
      status: 'failed',
      icon: <GiDoorHandle />
    },
    {
      id: 7,
      location: 'Puerta Secundaria',
      date: '12 Jun 2025',
      time: '03:30 PM',
      status: 'success',
      icon: <GiDoorHandle />
    },
    {
      id: 8,
      location: 'Puerta Principal',
      date: '12 Jun 2025',
      time: '07:45 AM',
      status: 'failed',
      icon: <GiDoorHandle />
    },
    {
      id: 9,
      location: 'Puerta Secundaria',
      date: '11 Jun 2025',
      time: '02:20 PM',
      status: 'success',
      icon: <GiDoorHandle />
    },
    {
      id: 10,
      location: 'Puerta Principal',
      date: '11 Jun 2025',
      time: '09:10 AM',
      status: 'success',
      icon: <GiDoorHandle />
    },
    {
      id: 11,
      location: 'Puerta Principal',
      date: '10 Jun 2025',
      time: '05:45 PM',
      status: 'failed',
      icon: <GiDoorHandle />
    },
    {
      id: 12,
      location: 'Puerta Secundaria',
      date: '10 Jun 2025',
      time: '08:15 AM',
      status: 'success',
      icon: <GiDoorHandle />
    }
  ];

  useEffect(() => {
    updateDisplayData();
    // eslint-disable-next-line
  }, [filter, currentPage]);

  const updateDisplayData = () => {
    let filteredData = mockAccessData;
    if (filter === 'exitosos') {
      filteredData = mockAccessData.filter(item => item.status === 'success');
    } else if (filter === 'fallidos') {
      filteredData = mockAccessData.filter(item => item.status === 'failed');
    }
    const total = Math.ceil(filteredData.length / itemsPerPage);
    setTotalPages(total);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);
    setAccessHistory(currentData);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getStatusText = (status) => {
    return status === 'success' ? 'Acceso Permitido' : 'Acceso Denegado';
  };

  const getStatusClass = (status) => {
    return status === 'success' ? styles.statusSuccess : styles.statusFailed;
  };

  return (
    <div className={styles.containerPrincipal}>
      <NavigationMenu userType="docente" onLogoutClick={onLogoutClick} />
      <header className={globalstyles.header}>
        <h1 className={globalstyles.title}>Historial de accesos</h1>
      </header>
      <div className={styles.container}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'todos' ? styles.active : ''}`}
            onClick={() => handleFilterChange('todos')}
          >
            Todos
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'exitosos' ? styles.active : ''}`}
            onClick={() => handleFilterChange('exitosos')}
          >
            Exitosos
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'fallidos' ? styles.active : ''}`}
            onClick={() => handleFilterChange('fallidos')}
          >
            Fallidos
          </button>
        </div>
        <div className={styles.accessList}>
          {accessHistory.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <div className={styles.emptyMessage}>No hay registros</div>
              <div className={styles.emptySubMessage}>
                No se encontraron accesos con los filtros seleccionados
              </div>
            </div>
          ) : (
            accessHistory.map((access, index) => (
              <div
                key={access.id}
                className={`${styles.accessItem} ${access.status === 'failed' ? styles.failed : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.accessContent}>
                  <div className={styles.accessInfo}>
                    <div className={styles.locationAccess}>
                      <div className={styles.locationIcon}>
                        {access.icon}
                      </div>
                      {access.location}
                    </div>
                    <div className={styles.dateTimeAccess}>
                      {access.time} • {access.date}
                    </div>
                    <div className={`${styles.accessStatus} ${getStatusClass(access.status)}`}>
                      <span className={styles.statusDot}></span>
                      {getStatusText(access.status)}
                    </div>
                  </div>
                  <div className={styles.additionalDetails}>
                    <div className={styles.accessArrow}>
                      ›
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className={styles.newPaginationContainer}>
            <button
              className={styles.paginationButton}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <IoIosArrowBack />
              Anterior
            </button>
            <div className={styles.pageIndicator}>
              Página {currentPage} de {totalPages}
            </div>
            <button
              className={styles.paginationButton}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <IoIosArrowForward />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
