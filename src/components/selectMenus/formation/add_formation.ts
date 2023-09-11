import { SelectMenu } from '../../../types';
import { StringSelectMenuInteraction } from 'discord.js';
import dayjs from 'dayjs';
import { Formation } from '../../../const/Formation';
import FormationSchema, { FORMATION } from '../../../models/FormatationModel';
dayjs.extend(require('dayjs/plugin/customParseFormat'));

const wait = require('node:timers/promises').setTimeout;

export const modals: SelectMenu = {
	data: {
		name: 'add_formation',
	},
	execute: async (interaction: StringSelectMenuInteraction) => {
		const newFormation: {
			_id: string;
			name: string;
			emoji: string;
			date: Date;
			updatedBy: string;
		} = {
			...Formation.find((option) => option._id === interaction.values[0]),
			updatedBy: interaction.user.id,
			date: new Date(),
		};

		const messageId = interaction.message.reference.messageId;
		const userFormationMessage: FORMATION = await FormationSchema.findOne({ messageId: messageId }).lean();
		if (userFormationMessage) {
			const updatedUserFormation: FORMATION = await FormationSchema.findOneAndUpdate(
				{ _id: userFormationMessage._id },
				{
					$push: {
						formations: newFormation
					}
				}
			).lean()
			const messageToUpdate = await interaction.channel.messages.fetch(messageId)
			await messageToUpdate.reactions.removeAll();
			const tier1Ids = Formation.filter(formation => formation.tier === 1).map(formation => formation._id)
			const tier2Ids = Formation.filter(formation => formation.tier === 2).map(formation => formation._id)
			const tier3Ids = Formation.filter(formation => formation.tier === 3).map(formation => formation._id)

			const completedFormationIds = updatedUserFormation.formations.map(f => f._id);
			const isAllTier1Done = tier1Ids.every(formationId => completedFormationIds.includes(formationId))
			const isAllTier2Done = tier2Ids.every(formationId => completedFormationIds.includes(formationId))
			const isAllTier3Done = tier3Ids.every(formationId => completedFormationIds.includes(formationId))
			if (isAllTier1Done) {
				messageToUpdate.react('🥇')
			} else {
				const tier1Done = Formation.filter(formation => formation.tier === 1).filter(formation => completedFormationIds.includes(formation._id)).map(formation => formation.emoji)
				for (const emoji of tier1Done) {
					messageToUpdate.react(emoji)
				}
			}
			if (isAllTier2Done) {
				messageToUpdate.react('🥈')
			} else {
				const tier2Done = Formation.filter(formation => formation.tier === 2).filter(formation => completedFormationIds.includes(formation._id)).map(formation => formation.emoji)
				for (const emoji of tier2Done) {
					messageToUpdate.react(emoji)
				}
			}
			if (isAllTier3Done) {
				messageToUpdate.react('🥉')
			} else {
				const tier3Done = Formation.filter(formation => formation.tier === 3).filter(formation => completedFormationIds.includes(formation._id)).map(formation => formation.emoji)
				for (const emoji of tier3Done) {
					messageToUpdate.react(emoji)
				}
			}
			await interaction.reply({
				content: 'Formation ajoutée',
				ephemeral: true,
			})
			await wait(5000);
			await interaction.deleteReply();

		}


	},
};

export default modals;
