import { Router, RequestHandler } from "express";
import { 
  login, 
  createUser, 
  refreshToken, 
  logout,
  getAllUsers 
} from "../controllers/auth.controller";
import { verifyToken, isAdmin, isSelfOrAdmin } from "../middlewares/auth";

import { 
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
  releaseUserCard 
} from "../controllers/tarjet.controller";

const router = Router();

router.post('/login', login as unknown as RequestHandler);
router.post('/refresh-token', refreshToken as unknown as RequestHandler);
router.post('/users', createUser as unknown as RequestHandler);

router.post('/forgot-password', forgotPassword as unknown as RequestHandler);
router.post('/reset-password', resetPassword as unknown as RequestHandler);

router.post('/logout', verifyToken as unknown as RequestHandler, logout as unknown as RequestHandler);
router.get('/all-users', verifyToken as unknown as RequestHandler, getAllUsers as unknown as RequestHandler);

router.put('/:id/update', verifyToken as unknown as RequestHandler, updateUser as unknown as RequestHandler);
router.patch('/:id/disable', verifyToken as unknown as RequestHandler, disableUser as unknown as RequestHandler);
router.patch('/:id/enable', verifyToken as unknown as RequestHandler, isAdmin as unknown as RequestHandler, enableUser as unknown as RequestHandler);
router.put('/:id/change-password', verifyToken as unknown as RequestHandler, changePassword as unknown as RequestHandler);

router.post('/addCard', verifyToken as unknown as RequestHandler, createCard as unknown as RequestHandler);
router.get('/cards', verifyToken as unknown as RequestHandler, getAllCards as unknown as RequestHandler);
router.put('/cards/:id/disable', verifyToken as unknown as RequestHandler, disableCard as unknown as RequestHandler);
router.put('/cards/:id/enable', verifyToken as unknown as RequestHandler, enableCard as unknown as RequestHandler);
router.delete('/cards/:id/delete', verifyToken as unknown as RequestHandler, deleteCard as unknown as RequestHandler);
router.get('/cards/available', verifyToken as unknown as RequestHandler, getAvailableCards as unknown as RequestHandler);

router.put('/cards/:id/assign', verifyToken as unknown as RequestHandler, assignCard as unknown as RequestHandler);

router.patch('/users/:id/card', verifyToken as unknown as RequestHandler, updateUserCardId as unknown as RequestHandler);
router.put('/cards/:id/unassign', verifyToken as unknown as RequestHandler, unassignCard as unknown as RequestHandler);
router.patch('/users/:id/release-card', verifyToken as unknown as RequestHandler, releaseUserCard as unknown as RequestHandler);

export default router;  