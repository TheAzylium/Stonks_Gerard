import mongoose from 'mongoose';

export interface ORDER_OF_THE_DAY {
  _id: string;
  day: Date;
  embed_message_id: string;
  updatedAt: Date;
  createdAt: Date;
  missions: [
    {
      _id: string;
      target: string;
      hour: string;
      nbrAgent?: string;
      where?: string;
      type: 'SAISIE' | 'SECURITY' | 'TRANSFERT' | 'BILLETS' | 'SECURISE';
    },
  ];
}

const OrderOfTheDaySchema = new mongoose.Schema(
  {
    missions: [
      {
        target: {
          type: String,
        },
        hour: {
          type: String,
        },
        nbrAgent: {
          type: String,
        },
        where: {
          type: String,
        },
        type: {
          type: String,
          enum: ['SAISIE', 'SECURITY', 'TRANSFERT', 'BILLETS', 'SECURISE'],
        },
      },
    ],
    day: {
      type: Date,
    },
    embed_message_id: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.OrderOfTheDay ||
  mongoose.model('OrderOfTheDay', OrderOfTheDaySchema);
