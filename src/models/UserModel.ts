import mongoose from 'mongoose';

export interface USER {
  discordId: string;
  rh_channel: string;
	embed_message_id: string;
  name: string
  phone: string;
  hiringDate: Date;
  accountNumber: string;
  role: {
    _id: string;
    name: string;
  },
  pole: string;
  number_weapon: number;
  last_medical_visit: Date;
	next_medical_visit: Date;
	updatedAt: Date;
	createdAt: Date;
	updatedBy: string;
}

const UserSchema = new mongoose.Schema({
	discordId: {
		type: String,
	},
	rh_channel: {
		type: String,
	},
	embed_message_id: {
		type: String,
	},
	name: {
		type: String,
	},
	phone: {
		type: String,
	},
	hiringDate: {
		type: Date,
	},
	accountNumber: {
		type: String,
	},
	role: {
		_id: {
			type: String,
		},
		name: {
			type: String,
		},
	},
	pole: {
		type: String,
	},
	number_weapon: {
		type: Number,
	},
	last_medical_visit: {
		type: Date,
	},
	next_medical_visit: {
		type: Date,
	},
	updatedBy: {
		type: String,
	},
}, { versionKey: false, timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
