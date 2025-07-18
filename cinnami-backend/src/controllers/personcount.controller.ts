import { Request, Response } from "express";
import { PersonCount } from "../models/PersonCount";
import { Door } from "../models/Door";

// Obtener el último conteo de personas ingresadas
export const getLatestPersonCount = async (req: Request, res: Response) => {
  try {
    const doc: any = await PersonCount.findOne().sort({ timestamp: -1 });
    res.json({ count: doc ? doc.counterValue : 0 });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el conteo", error });
  }
};
