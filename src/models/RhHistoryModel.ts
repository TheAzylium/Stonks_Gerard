import mongoose from 'mongoose'

export interface RHHISTORY {
  discordId: string
  updatedAt: Date
  createdAt: Date
  newRole: {
    _id: string
    name: string
  }
  updatedBy: string
}

const RhHistorySchema = new mongoose.Schema(
  {
    discordId: {
      type: String,
    },
    newRole: {
      _id: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    updatedBy: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true },
)

export default mongoose.model<RHHISTORY>('RhHistory', RhHistorySchema)
