import { Request, Response } from "express";
import { Door } from "../models/Door";

// Obtener el estado más reciente de la puerta
export const getLatestDoorState = async (req: Request, res: Response) => {
  try {
    const latest: any = await Door.findOne().sort({ timestamp: -1 });
    res.json({
      state: latest?.state ?? "desconocido",
      name: latest?.name ?? "Sin puerta"
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el estado de la puerta", error });
  }
};
