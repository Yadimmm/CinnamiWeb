import { Router, RequestHandler } from "express";
import { 
  login,  
  refreshToken, 
  logout
} from "../controllers/auth.controller";
import { verifyToken, isAdmin, isSelfOrAdmin } from "../middlewares/auth";

import { 
  createUser,
  getAllUsers,
  updateUser, 
  disableUser, 
  enableUser, 
  changePassword, 
  updateUserCardId,
  forgotPassword,   
  resetPassword     
} from "../controllers/user.controller";
import { 
  assignCard, 
  createCard, 
  deleteCard, 
  disableCard, 
  enableCard, 
  getAllCards, 
  getAvailableCards, 
  unassignCard, 
  releaseUserCard,
  permanentBlockCard 
} from "../controllers/tarjet.controller";

import {
  getLatestDoorState
} from "../controllers/door.controller";

import {
  getLatestPersonCount
} from "../controllers/personcount.controller";

import { 
  getRecentAccessEvents 
} from "../controllers/accessEvent.controller";

const router = Router();
// Login endpoint
router.post('/login', login as unknown as RequestHandler); 
// Refresh token endpoint
router.post('/refresh-token', refreshToken as unknown as RequestHandler); 
// Create user endpoint
router.post('/users', createUser as unknown as RequestHandler); 
 // Forgot password endpoint
router.post('/forgot-password', forgotPassword as unknown as RequestHandler);
// Reset password endpoint
router.post('/reset-password', resetPassword as unknown as RequestHandler); 
// Logout endpoint
router.post('/logout', verifyToken as unknown as RequestHandler, logout as unknown as RequestHandler); 
// Get all users endpoint
router.get('/all-users', verifyToken as unknown as RequestHandler, getAllUsers as unknown as RequestHandler); 
// Update user endpoint
router.put('/:id/update', verifyToken as unknown as RequestHandler, updateUser as unknown as RequestHandler); 
// Deshabilitar user endpoint
router.patch('/:id/disable', verifyToken as unknown as RequestHandler, disableUser as unknown as RequestHandler); 
// Habilitar usuario endpoint
router.patch('/:id/enable', verifyToken as unknown as RequestHandler, isAdmin as unknown as RequestHandler, enableUser as unknown as RequestHandler);
// Cambiar Contrasena endpoint 
router.put('/:id/change-password', verifyToken as unknown as RequestHandler, changePassword as unknown as RequestHandler);
// Crear tarjeta
router.post('/addCard', verifyToken as unknown as RequestHandler, createCard as unknown as RequestHandler);
// Ver todas las tarjetas
router.get('/cards', verifyToken as unknown as RequestHandler, getAllCards as unknown as RequestHandler);
// Deshabilitar tarjeta
router.put('/cards/:id/disable', verifyToken as unknown as RequestHandler, disableCard as unknown as RequestHandler);
// Habilitar tarjeta
router.put('/cards/:id/enable', verifyToken as unknown as RequestHandler, enableCard as unknown as RequestHandler);
// Eliminar tarjeta
router.delete('/cards/:id/delete', verifyToken as unknown as RequestHandler, deleteCard as unknown as RequestHandler);
// Bloquear tarjeta permanentemente
router.put('/cards/:id/permanent-block', verifyToken as unknown as RequestHandler, permanentBlockCard as unknown as RequestHandler);
// Obtener tarjetas disponibles
router.get('/cards/available', verifyToken as unknown as RequestHandler, getAvailableCards as unknown as RequestHandler);
// Asignar tarjeta a usuario
router.put('/cards/:id/assign', verifyToken as unknown as RequestHandler, assignCard as unknown as RequestHandler);
// Actualizar tarjeta de usuario
router.patch('/users/:id/card', verifyToken as unknown as RequestHandler, updateUserCardId as unknown as RequestHandler);
// Desasignar tarjeta de usuario
router.put('/cards/:id/unassign', verifyToken as unknown as RequestHandler, unassignCard as unknown as RequestHandler);
// Liberar tarjeta de usuario
router.patch('/users/:id/release-card', verifyToken as unknown as RequestHandler, releaseUserCard as unknown as RequestHandler);
//Conteo de personas
router.get('/personcount/latest', verifyToken as unknown as RequestHandler, getLatestPersonCount as unknown as RequestHandler);
// Estado más reciente de la puerta
router.get('/door/latest', verifyToken as unknown as RequestHandler, getLatestDoorState as unknown as RequestHandler);
// Eventos de acceso recientes
router.get('/access-events/recent', verifyToken as unknown as RequestHandler, getRecentAccessEvents as unknown as RequestHandler);

export default router;  