import { BotEvent } from '../types';
import { Events, Interaction, InteractionType } from 'discord.js';

const event: BotEvent = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction: Interaction) {
		if (interaction.isChatInputCommand()) {

			const commands = interaction.client.slashCommands.get(interaction.commandName);

			if (!commands) return;

			await commands.execute(interaction);
		}
		else if (interaction.isButton()) {
			const buttons = interaction.client.buttons.get(interaction.customId);
			if (!buttons) return;
			await buttons.execute(interaction);

		}
		else if (interaction.type === InteractionType.ModalSubmit) {
			const { modals } = interaction.client;
			const modal = modals.get(interaction.customId);
			if (!modal) return;
			await modal.execute(interaction);
		}
	},
};

export default event;
