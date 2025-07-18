import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { User } from "../models/User";
import { RefreshToken } from "../utils/RefreshToken";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dayjs from "dayjs";

// Inicio de sesion
export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    try {
        //Busca el usuario
        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        }).select('+password');

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Verifica si el usuario esta habilitado o deshabilitado
        if (user.status === false) {
            return res.status(403).json({
                message: "Tu cuenta ha sido deshabilitada. Contacta al administrador para más información.",
                code: "ACCOUNT_DISABLED"
            });
        }

        //Verifica la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" }); // Mismo mensaje por seguridad
        }

        // Genera token
        const accessToken = generateAccessToken({
            _id: user._id.toString(),
            role: user.role,
            username: user.username
        });
        const refreshToken = generateRefreshToken(user._id.toString());

        //Guarda refresh token en DB 
        await RefreshToken.create({
            token: refreshToken,
            userId: user._id,
            expiresAt: dayjs().add(7, 'days').toDate()
        });

        //Actualizar último inicio de sesión
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
                status: user.status,
                firstName: user.firstName,
                lastName: user.lastName,
                cardId: user.cardId
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            message: "Error interno en el servidor",
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

//Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Token de actualización requerido' });
    }

    try {
        // Verifica el token en DB
        const storedToken = await RefreshToken.findOne({ token });
        if (!storedToken || dayjs(storedToken.expiresAt).isBefore(dayjs())) {
            return res.status(403).json({ message: 'Refresh token inválido o expirado' });
        }

        //Verifica firma JWT
        if (!process.env.REFRESH_SECRET) {
        throw new Error("Falta la variable REFRESH_SECRET en el entorno (.env)");
        }
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET) as { userId: string };

        //Buscar usuario por ID
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        //Genera nuevos tokens
        const newAccessToken = generateAccessToken({
            _id: user._id.toString(),
            role: user.role,
            username: user.username
        });
        const newRefreshToken = generateRefreshToken(user._id.toString());

        //Actualiza refresh token en DB
        await RefreshToken.findByIdAndUpdate(storedToken._id, {
            token: newRefreshToken,
            expiresAt: dayjs().add(7, 'days').toDate()
        });

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        return res.status(403).json({ message: 'Refresh token inválido' });
    }
};

// Cerrar sesión
export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
        // Eliminar refresh token de la DB
        await RefreshToken.deleteOne({ token: refreshToken });
        res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al cerrar sesión',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
