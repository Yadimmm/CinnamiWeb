import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!ACCESS_SECRET) throw new Error("Falta JWT_SECRET en .env");
if (!REFRESH_SECRET) throw new Error("Falta REFRESH_SECRET en .env");

export const generateAccessToken = (user: { _id: string; role: string; username?: string }) => {
  return jwt.sign(
    {
      userId: user._id,       
      role: user.role,         
      username: user.username, 
    },
    ACCESS_SECRET,
    { expiresIn: '2h' }
  );
};

// Refreshtoken solo requiere el userId 
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};
