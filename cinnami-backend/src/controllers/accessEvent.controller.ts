import { Request, Response } from "express";
import { AccessEvent } from "../models/AccessEvent";

// Devuelve los últimos 10 accesos recientes
export const getRecentAccessEvents = async (req: Request, res: Response) => {
  try {
    // Trae los últimos 10 registros, ordenados del más nuevo al más antiguo
    const events = await AccessEvent.find().sort({ timestamp: -1 }).limit(10);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener accesos recientes", error });
  }
};
