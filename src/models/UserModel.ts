import mongoose, {Types} from "mongoose";
const UserSchema = new mongoose.Schema({
  discordId: {
    type: String,
  },
  rh_channel: {
    type: String,
  },
  lastname: {
    type: String,
  },
  firstName: {
    type: String,
  },
  phone: {
    type: String,
  },
  hiringDate: {
    type: Date,
    default: Date.now,
  },
  accountNumber: {
    type: String,
  },
  role: {
    _id: {
      type: String
    },
    name: {
      type: String,
    }
  },
  pole: {
    type: String
  },
  number_weapon: {
    type: Number,
  },
  last_medical_visit: {
    type: Date,
    default: Date.now,
  }
})

export default mongoose.models.User || mongoose.model('User', UserSchema);
