import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { User } from "../models/User";
import { RefreshToken } from "../utils/RefreshToken";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dayjs from "dayjs";
import { Types } from 'mongoose';
import { Card } from "../models/Card";
import { sendResetEmail } from '../utils/sendEmail';
import crypto from "crypto";

// Crear usuario
export const createUser = async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
            email,
            role,
            firstName,
            lastName,
            cardId,
        } = req.body;

        // Verifica si ya existe el usuario
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "El nombre de usuario ya existe" });
        }

        // Encripta contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            role,
            firstName,
            lastName,
            cardId,
            doorOpenReminderMinutes: false,
            createdAt: new Date(),
            lastLogin: null,
            status: true
        });

        const savedUser = await newUser.save();

        return res.status(201).json({ user: savedUser });

    } catch (error) {
        console.error("Error ocurrido en createUser: ", error);
        return res.status(500).json({
            message: "Error al crear usuario",
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// Obtener todos los usuarios
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los usuarios',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// Editar usuario
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            username,
            email,
            role,
            firstName,
            lastName,
            cardId
        } = req.body;

        // Validar id
        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de usuario inválido" });
        }

        // Busca un usuario existente
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verifica si el nuevo username
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({ message: "El nombre de usuario ya está en uso" });
            }
        }

        //Validar que la tarjeta no esté asignada a otro usuario
        let cardIdToStore = cardId || null;
        if (typeof cardId === 'string' && cardId.length === 24 && Types.ObjectId.isValid(cardId)) {
        const cardObj = await Card.findById(cardId);
        if (cardObj) {
        cardIdToStore = cardObj.uid;
          }
       }
        // Validar que la tarjeta no esté asignada a otro usuario
        const anotherUserWithCard = await User.findOne({ cardId: cardIdToStore, _id: { $ne: id } });
        if (anotherUserWithCard) {
        return res.status(409).json({ message: "Esa tarjeta ya está asignada a otro usuario" });
    }

        // Actualiza los campos permitidos
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                username: username || user.username,
                email: email || user.email,
                role: role || user.role,
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                cardId: cardIdToStore
            },
            { new: true, runValidators: true }
        ).select('-password');

        return res.status(200).json({
            message: "Usuario actualizado correctamente",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error en updateUser: ", error);
        return res.status(500).json({
            message: "Error al actualizar usuario",
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// Cambio de contraseña
export const changePassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        // Validar id
        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de usuario inválido" });
        }

        // Busca el usuario
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Encripta la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualiza la contraseña
        await User.findByIdAndUpdate(id, { $set: { password: hashedPassword } });

        return res.status(200).json({ message: "Contraseña actualizada correctamente" });

    } catch (error) {
        console.error("Error en changePassword:", error);
        return res.status(500).json({
            message: "Error al cambiar la contraseña",
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// Deshabilitar usuario (cambiar status a false y liberar tarjeta)
export const disableUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validar id
        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de usuario inválido" });
        }

        // Verifica si el usuario existe
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Si el usuario tiene tarjeta, libera la tarjeta y elimina el campo cardId
        if (user.cardId) {
            // Libera la tarjeta en la colección de tarjetas
            const card = await Card.findOne({ uid: user.cardId });
            if (card) {
                card.assignedTo = undefined;
                await card.save();
            }
            // Elimina el campo cardId del usuario
            await User.updateOne({ _id: id }, { $unset: { cardId: "" } });
        }

        const disabledUser = await User.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        ).select('-password');

        return res.status(200).json({
            message: "Usuario deshabilitado correctamente",
            user: disabledUser
        });

    } catch (error) {
        console.error("Error en disableUser: ", error);
        return res.status(500).json({
            message: "Error al deshabilitar usuario",
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// Habilitar usuario
export const enableUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validar id
        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de usuario inválido" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const enabledUser = await User.findByIdAndUpdate(
            id,
            { status: true },
            { new: true }
        ).select('-password');

        return res.status(200).json({
            message: "Usuario habilitado correctamente",
            user: enabledUser
        });

    } catch (error) {
        console.error("Error en enableUser: ", error);
        return res.status(500).json({
            message: "Error al habilitar usuario",
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// Actualiza la tarjeta del usuario
export const updateUserCardId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { cardId } = req.body;

        // Validar id
        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }
        if (cardId && typeof cardId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'El ID de tarjeta debe ser una cadena de texto'
            });
        }

        // Verifica que la tarjeta no esté asignada a otro usuario
        if (cardId) {
            const anotherUserWithCard = await User.findOne({ cardId, _id: { $ne: id } });
            if (anotherUserWithCard) {
                return res.status(409).json({
                    success: false,
                    message: 'Esa tarjeta ya está asignada a otro usuario'
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { cardId },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tarjeta actualizada exitosamente',
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la tarjeta del usuario',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// Solicitar recuperación envía correo
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Genera token seguro
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await user.save();

        const resetLink = `http://localhost:3001/reset-password?token=${token}`;
        await sendResetEmail(user.email, resetLink);

        return res.json({ message: "Se envió un correo con el enlace para restablecer la contraseña." });
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ message: "Error al procesar la solicitud." });
    }
};

// Restablece la contraseña
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        console.log("Token recibido:", token);

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        console.log("Usuario encontrado:", user);

        if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

        // Cambia contraseña 
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.json({ message: "Contraseña restablecida exitosamente" });
    } catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(500).json({ message: "Error al restablecer la contraseña." });
    }
};
