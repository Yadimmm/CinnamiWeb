import { Schema, model, Document } from "mongoose";

export interface IDoor extends Document {
  nombre: string;        
  edificio: string;      
  descripcion?: string;
  activa: boolean;
  state: "open" | "close"; 
}

const DoorSchema = new Schema<IDoor>({
  nombre: { 
    type: String, 
    required: true 
  },
  edificio: { 
    type: String, 
    required: true 
  },
  descripcion: { 
    type: String 
  },
  activa: { 
    type: Boolean, 
    default: true 
  },
  state: {
    type: String,
    enum: ["open", "close"],
    required: true,
    default: "close"
  }
});

export const Door = model<IDoor>('Door', DoorSchema);
