import { SelectMenu } from '../../../types';
import { StringSelectMenuInteraction } from 'discord.js';
import dayjs from 'dayjs';
import FormationSchema, { FORMATION } from '../../../models/FormatationModel';
import { PosteList } from '../../../const/RolesList';
dayjs.extend(require('dayjs/plugin/customParseFormat'));

const wait = require('node:timers/promises').setTimeout;

export const modals: SelectMenu = {
  data: {
    name: 'change_rank',
  },
  execute: async (interaction: StringSelectMenuInteraction) => {
    const newRole = {
      _id: interaction.values[0],
      name: PosteList.find(option => option.value === interaction.values[0])
        ?.label,
    };
    const messageId = interaction.message.reference.messageId;
    const userFormationMessage: FORMATION = await FormationSchema.findOne({
      messageId: messageId,
    }).lean();
    if (userFormationMessage) {
      await FormationSchema.updateOne(
        { _id: userFormationMessage._id },
        {
          role: newRole,
        },
        { new: true },
      ).lean();
      const messageToUpdate =
        await interaction.channel.messages.fetch(messageId);

      const oldContentMessage = messageToUpdate.content;
      const lastPart = oldContentMessage.split(':').pop();

      await messageToUpdate.edit({
        content: `__${newRole.name}__ : ${lastPart}`,
      });
      await interaction.reply({
        content: 'Grade mis à jour !',
        ephemeral: true,
      });
      await wait(5000);
      await interaction.deleteReply();
    }
  },
};

export default modals;
