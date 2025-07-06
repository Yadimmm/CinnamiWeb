import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { User } from "../models/User";
import { Card } from "../models/Card";
import { RefreshToken } from "../utils/RefreshToken";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dayjs from "dayjs";

/** ========================
 *        LOGIN
 *  ======================== */
export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        }).select('+password');

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        if (user.status === false) {
            return res.status(403).json({
                message: "Tu cuenta ha sido deshabilitada. Contacta al administrador para más información.",
                code: "ACCOUNT_DISABLED"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        await RefreshToken.create({
            token: refreshToken,
            userId: user._id,
            expiresAt: dayjs().add(7, 'days').toDate()
        });

        user.lastLogin = new Date();
        await user.save();

        return res.json({
            message: 'Login exitoso',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error interno en el servidor" });
    }
};

/** ========================
 *     REFRESH TOKEN
 *  ======================== */
export const refreshToken = async (req: Request, res: Response) => {
    if (!req.body) {
        return res.status(400).json({
            message: 'Request body is required',
            error: 'MISSING_BODY'
        });
    }
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({
            message: 'Token de actualización requerido',
            error: 'MISSING_TOKEN'
        });
    }
    try {
        const storedToken = await RefreshToken.findOne({ token });
        if (!storedToken || dayjs(storedToken.expiresAt).isBefore(dayjs())) {
            return res.status(403).json({
                message: 'Refresh token inválido o expirado',
                error: 'INVALID_TOKEN'
            });
        }
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET || 'refresh_secret') as { userId: string };

        const newAccessToken = generateAccessToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);

        await RefreshToken.findByIdAndUpdate(storedToken._id, {
            token: newRefreshToken,
            expiresAt: dayjs().add(7, 'days').toDate()
        });

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        console.error('Refresh token error:', err);
        return res.status(403).json({
            message: 'Refresh token inválido',
            error: 'TOKEN_VERIFICATION_FAILED'
        });
    }
};

/** ========================
 *        LOGOUT
 *  ======================== */
export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    try {
        await RefreshToken.deleteOne({ token: refreshToken });
        res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};

/** ========================
 *    CREAR NUEVO USUARIO
 *  ======================== */
export const createUser = async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
            email,
            role,
            firstName,
            lastName,
            cardId, // Espera el ObjectId de la tarjeta (NO el UID)
        } = req.body;

        // Verificar si ya existe el usuario
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "El nombre de usuario ya existe" });
        }

        // Buscar la tarjeta por ObjectId y asegurar que está disponible
        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(400).json({ message: "Tarjeta no encontrada" });
        }
        if (!card.state || card.assignedTo) {
            return res.status(400).json({ message: "Tarjeta no disponible" });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Aquí User guarda el UID de la tarjeta, no el ObjectId
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            role,
            firstName,
            lastName,
            cardId: card.uid, // Guardar el UID aquí
            doorOpenReminderMinutes: false,
            createdAt: new Date(),
            lastLogin: null,
            status: true
        });

        const savedUser = await newUser.save();

        // Marcar la tarjeta como asignada (assignedTo = userId, state = false)
        card.assignedTo = savedUser._id;
        card.state = false;
        await card.save();

        return res.status(201).json({ user: savedUser });

    } catch (error) {
        console.error("Error ocurrido en createUser: ", error);
        return res.status(500).json({ message: "Error al crear usuario", error });
    }
};

/** ========================
 *    OBTENER TODOS USUARIOS
 *  ======================== */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
};

/** ========================
 *    DESHABILITAR USUARIO Y LIBERAR TARJETA
 *  ======================== */
export const disableUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'No existe el usuario' });

        // Buscar la tarjeta por UID (el guardado en user.cardId) y liberarla
        if (user.cardId) {
            const card = await Card.findOne({ uid: user.cardId });
            if (card) {
                card.state = true;
                card.assignedTo = null;
                await card.save();
            }
        }

        user.status = false;
        await user.save();
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Error al deshabilitar usuario' });
    }
};

/** ========================
 *    HABILITAR USUARIO Y REASIGNAR TARJETA
 *  ======================== */
export const enableUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'No existe el usuario' });

        // Busca la tarjeta por UID y la asigna otra vez si está libre
        if (user.cardId) {
            const card = await Card.findOne({ uid: user.cardId });
            if (card && !card.assignedTo) {
                card.state = false;
                card.assignedTo = user._id;
                await card.save();
            }
        }

        user.status = true;
        await user.save();
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Error al habilitar usuario' });
    }
};

/** ========================
 *    ELIMINAR USUARIO Y LIBERAR TARJETA (Opcional)
 *  ======================== */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'No existe el usuario' });

        // Buscar la tarjeta por UID y liberarla
        if (user.cardId) {
            const card = await Card.findOne({ uid: user.cardId });
            if (card) {
                card.state = true;
                card.assignedTo = null;
                await card.save();
            }
        }

        await user.deleteOne();
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};
