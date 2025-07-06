import { Router } from "express";
import { 
  login, 
  createUser, 
  refreshToken, 
  logout,
  getAllUsers
} from "../controllers/auth.controller"; 

import { 
  updateUser, disableUser, enableUser, changePassword 
} from "../controllers/user.controller"; // <- Te faltaba este import

import { verifyToken, isAdmin, isSelfOrAdmin } from "../middlewares/auth";

import { 
  createCard, deleteCard, disableCard, enableCard, getAllCards, 
  getAvailableCards // <-- Ya lo tienes bien
} from "../controllers/tarjet.controller";

const router = Router();

// rutas públicas
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/users', createUser);

// rutas protegidas
router.post('/logout', verifyToken, logout);
router.get('/all-users', verifyToken, getAllUsers);

router.put('/:id/update', updateUser);
router.patch('/:id/disable', disableUser);
router.patch('/:id/enable', isAdmin, enableUser);
router.post('/:id/change-password', isSelfOrAdmin, changePassword);

// tarjetas
router.post('/addCard', createCard);
router.get('/cards', verifyToken, getAllCards);

// **RUTA DISPONIBLES**
router.get('/cards/available', verifyToken, getAvailableCards);

router.put('/cards/:id/disable', disableCard);
router.put('/cards/:id/enable', enableCard);
router.delete('/cards/:id/delete', deleteCard);

export default router;
