import { Request, Response } from 'express';
import { Card } from '../models/Card';
import { Types } from 'mongoose';
import { User } from '../models/User';

// Crear nueva tarjeta solo UID
export const createCard = async (req: Request, res: Response) => {
  try {
    const { uid } = req.body;

    // Validar que se envió el UID y es string no vacío
    if (typeof uid !== 'string' || !uid.trim()) {
      return res.status(400).json({
        message: 'El UID de la tarjeta es requerido y debe ser un string'
      });
    }

    // Verificar que no exista una tarjeta con ese UID
    const existingCard = await Card.findOne({ uid: uid.toUpperCase() });
    if (existingCard) {
      return res.status(409).json({
        message: 'Ya existe una tarjeta con ese UID'
      });
    }

    // Crea nueva tarjeta
    const newCard = new Card({
      uid: uid.toUpperCase(),
      state: true,
      issueDate: new Date(),
      disabledAt: undefined,
      assignedTo: undefined
    });
    // Guarda la tarjeta en la base de datos
    const savedCard = await newCard.save();

    return res.status(201).json({ 
      message: 'Tarjeta creada exitosamente',
      card: savedCard 
    });

  } catch (error) {
    console.error('Error ocurrido en createCard:', error);
    return res.status(500).json({ 
      message: 'Error al crear tarjeta', 
      error 
    });
  }
};

// Obtener todas las tarjetas
export const getAllCards = async (req: Request, res: Response) => {
  try {
    const cards = await Card.find()
      .populate('assignedTo', 'username email firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      message: 'Tarjetas obtenidas exitosamente',
      cards 
    });

  } catch (error) {
    console.error('Error ocurrido en getAllCards:', error);
    res.status(500).json({ message: 'Error al obtener las tarjetas' });
  }
};

// Obtener tarjetas disponibles para asignar
export const getAvailableCards = async (req: Request, res: Response) => {
  try {
    const availableCards = await Card.find({
      state: true,
      assignedTo: null
    }).sort({ createdAt: -1 });

    res.status(200).json({ 
      message: 'Tarjetas disponibles obtenidas exitosamente',
      cards: availableCards,
      total: availableCards.length
    });

  } catch (error) {
    console.error('Error ocurrido en getAvailableCards:', error);
    res.status(500).json({ message: 'Error al obtener tarjetas disponibles' });
  }
};

// Obtener tarjeta específica
export const getCardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de tarjeta inválido'
      });
    }

    const card = await Card.findById(id)
      .populate('assignedTo', 'username email firstName lastName');

    if (!card) {
      return res.status(404).json({
        message: 'Tarjeta no encontrada'
      });
    }

    res.status(200).json({
      message: 'Tarjeta obtenida exitosamente',
      card
    });

  } catch (error) {
    console.error('Error ocurrido en getCardById:', error);
    res.status(500).json({ message: 'Error al obtener la tarjeta' });
  }
};

// Edita UID de tarjeta
export const updateCardUID = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de tarjeta inválido'
      });
    }

    // Validar que uid es string no vacío
    if (typeof uid !== 'string' || !uid.trim()) {
      return res.status(400).json({
        message: 'El nuevo UID es requerido y debe ser un string'
      });
    }

    // Verifica que no exista otra tarjeta con ese UID
    const existingCard = await Card.findOne({ 
      uid: uid.toUpperCase(),
      _id: { $ne: id }
    });

    if (existingCard) {
      return res.status(409).json({
        message: 'Ya existe otra tarjeta con ese UID'
      });
    }

    // Actualiza la tarjeta
    const updatedCard = await Card.findByIdAndUpdate(
      id,
      { uid: uid.toUpperCase() },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email firstName lastName');

    if (!updatedCard) {
      return res.status(404).json({
        message: 'Tarjeta no encontrada'
      });
    }

    res.status(200).json({
      message: 'UID de tarjeta actualizado exitosamente',
      card: updatedCard
    });

  } catch (error) {
    console.error('Error ocurrido en updateCardUID:', error);
    res.status(500).json({ message: 'Error al actualizar UID de tarjeta', error });
  }
};

// Deshabilita la tarjeta
export const disableCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de tarjeta inválido'
      });
    }

    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({
        message: 'Tarjeta no encontrada'
      });
    }

    // Cambia el estado 
    card.state = false;
    card.disabledAt = new Date();
    const updatedCard = await card.save();

    res.status(200).json({
      message: 'Tarjeta deshabilitada exitosamente',
      card: updatedCard
    });

  } catch (error) {
    console.error('Error ocurrido en disableCard:', error);
    res.status(500).json({ message: 'Error al deshabilitar tarjeta', error });
  }
};

// Rehabilita la tarjeta
export const enableCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de tarjeta inválido'
      });
    }

    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({
        message: 'Tarjeta no encontrada'
      });
    }

    // Cambia el estado a activa
    card.state = true;
    card.disabledAt = undefined;
    const updatedCard = await card.save();

    res.status(200).json({
      message: 'Tarjeta rehabilitada exitosamente',
      card: updatedCard
    });

  } catch (error) {
    console.error('Error ocurrido en enableCard:', error);
    res.status(500).json({ message: 'Error al rehabilitar tarjeta', error });
  }
};

// Elimina tarjeta
export const deleteCard = async (req: Request, resp: Response) =>{
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return resp.status(400).json({
        message: 'ID de tarjeta inválido'
      });
    }

    const card = await Card.findByIdAndDelete(id);

    if (!card) {
      return resp.status(404).json({
        message: 'Tarjeta no encontrada'
      });
    }

    resp.status(200).json({
      message: 'Tarjeta eliminada exitosamente',
      card
    });

  } catch (error) {
    console.error('Error ocurrido en deleteCard:', error);
    resp.status(500).json({ message: 'Error al eliminar tarjeta', error });
  }
}

// Asigna tarjeta a un usuario
export const assignCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de tarjeta inválido'
      });
    }

    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({
        message: 'Tarjeta no encontrada'
      });
    }

    // Permite desasignar si userId no viene o es null
    if (!userId) {
      card.assignedTo = null;
      card.state = true;
      await card.save();
      return res.status(200).json({
        message: 'Tarjeta desasignada exitosamente',
        card
      });
    }

    if (typeof userId !== 'string' || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: 'ID de usuario inválido'
      });
    }

    // Asigna la tarjeta
    card.assignedTo = new Types.ObjectId(userId);
    card.state = true;
    const updatedCard = await card.save();

    res.status(200).json({
      message: 'Tarjeta asignada exitosamente',
      card: updatedCard
    });

  } catch (error) {
    console.error('Error ocurrido en assignCard:', error);
    res.status(500).json({ message: 'Error al asignar/desasignar tarjeta', error });
  }
};

// Desasigna tarjeta 
export const unassignCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de tarjeta inválido'
      });
    }

    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({
        message: 'Tarjeta no encontrada'
      });
    }

    card.assignedTo = null;
    const updatedCard = await card.save();

    res.status(200).json({
      message: 'Tarjeta desasignada exitosamente',
      card: updatedCard
    });

  } catch (error) {
    console.error('Error ocurrido en unassignCard:', error);
    res.status(500).json({ message: 'Error al desasignar tarjeta', error });
  }
};

// Desasigna la tarjeta desde el usuario
export const releaseUserCard = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (typeof userId !== 'string' || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.cardId) {
      // Libera la tarjeta en la colección de tarjetas
      const card = await Card.findOne({ uid: user.cardId });
      if (card) {
        card.assignedTo = null;
        await card.save();
      }
      // Libera la tarjeta en el usuario
      await User.updateOne({ _id: userId }, { $set: { cardId: null } });
    }

    res.status(200).json({ message: 'Tarjeta liberada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al liberar tarjeta', error });
  }
};
// Bloqueo permanente de tarjeta
export const permanentBlockCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de tarjeta inválido'
      });
    }

    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({
        message: 'Tarjeta no encontrada'
      });
    }

    card.permanentBlocked = true; 
    card.state = false;             
    card.disabledAt = new Date();
    await card.save();

    res.status(200).json({
      message: 'Tarjeta bloqueada permanentemente',
      card
    });

  } catch (error) {
    console.error('Error en permanentBlockCard:', error);
    res.status(500).json({ message: 'Error al bloquear permanentemente la tarjeta', error });
  }
};