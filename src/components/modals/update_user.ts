import { Modals } from '../../types';
import { ModalSubmitInteraction } from 'discord.js';

export const modals: Modals = {
	data:{
		name: 'update_user',
	},
	execute: async (interaction: ModalSubmitInteraction) => {

		await interaction.reply({ content: `Tu as mis à jour le profil de ${interaction.fields.getTextInputValue('first-name')} ${interaction.fields.getTextInputValue('last-name')}`, ephemeral: true });

	},
};

export default modals;
