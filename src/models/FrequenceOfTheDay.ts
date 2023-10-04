import mongoose from 'mongoose';

export interface FREQUENCEOFTHEDAY {
  transfert: string;
  interne: string;
  security: string;
  embedId?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

const FrequenceOfTheDaySchema = new mongoose.Schema(
  {
    transfert: {
      type: String,
    },
    interne: {
      type: String,
    },
    security: {
      type: String,
    },
    embedId: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true },
);

export default mongoose.model<FREQUENCEOFTHEDAY>(
  'FrequenceOfTheDay',
  FrequenceOfTheDaySchema,
);
