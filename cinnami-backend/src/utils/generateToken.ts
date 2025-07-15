import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_SECRET || 'default_secret';

export const generateAccessToken = (user: { _id: string; role: string; username?: string }) => {
  return jwt.sign(
    {
      userId: user._id,        // ¡Siempre el ID!
      role: user.role,         // ¡Incluye el rol!
      username: user.username, // Opcional, útil para mostrar
    },
    ACCESS_SECRET,
    { expiresIn: '2h' }
  );
};

// Refreshtoken solo requiere el userId (puedes dejarlo así si no lo usas para permisos)
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '7d' }
  );
};
