import { BotEvent } from '../types';
import { Client, Events } from 'discord.js';
import mongoose from 'mongoose';

const event: BotEvent = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		await mongoose.connect(process.env.MONGODB_URI);
		if (mongoose.connect) {
			console.log('🗄️ Connected to MongoDB');
		}
		else {
			console.log('❌ Error while connecting to MongoDB');
		}
		console.log((`💪 Logged in as ${client.user?.tag}`));
	},
};

export default event;
