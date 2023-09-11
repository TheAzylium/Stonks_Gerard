import mongoose from 'mongoose';


export interface FORMATION {
	_id: string;
	discordId: string;
	messageId: string;
	role: {
		_id: string;
		name: string;
	},
	formations: [
		{
			_id: string;
			name: string;
			emoji: string;
			date: Date;
			updatedBy: string;
		}
	]
	createAt: Date;
	updatedAt: Date;
}

const FormationSchema = new mongoose.Schema({
	discordId: {
		type: String,
	},
	messageId: {
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
	formations: [
		{
			_id: {
				type: String,
			},
			name: {
				type: String,
			},
			date: {
				type: Date,
			},
			updatedBy: {
				type: String,
			}
		}
	],
}, { timestamps: true, versionKey: false });

export default mongoose.model<FORMATION>('Formation', FormationSchema);
