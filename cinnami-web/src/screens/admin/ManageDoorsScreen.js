import React from 'react';
import NavigationMenu from '../../components/Navigation/NavigationMenu';
import globalstyles from '../../styles/globalStyles.module.css'
export default function ManageDoorsScreen() {
  return (
    <div>
      <NavigationMenu userType="admin" />
      <header className={globalstyles.header}>
          <h1 className={globalstyles.title}>Administración de Usuarios</h1>
        </header>
      <p>Aquí puedes añadir o eliminar puertas del sistema.</p>
    </div>
  );
}
