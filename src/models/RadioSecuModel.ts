import mongoose from 'mongoose';

export interface RADIOSECU {
  updatedBy: string;
  frequence: string;
  updatedAt: Date;
  createdAt: Date;
}

const RadioSecuSchema = new mongoose.Schema(
  {
    updatedBy: {
      type: String,
    },
    frequence: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true },
);

export default mongoose.model<RADIOSECU>('RadioSecu', RadioSecuSchema);
