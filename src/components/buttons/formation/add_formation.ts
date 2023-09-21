import { Buttons } from '../../../types';
import { StringSelectMenuBuilder } from 'discord.js';
import FormationSchema, { FORMATION } from '../../../models/FormatationModel';
import { Formation } from '../../../const/Formation';
import { ActionRowBuilder } from 'discord.js';
const wait = require('node:timers/promises').setTimeout;
const { FORMATEUR_ROLE_ID, HS_ROLE_ID, ADMIN_ROLE_ID } = process.env;
require('dayjs');
export const button: Buttons = {
  data: {
    name: 'add_formation',
  },
  execute: async interaction => {
    const roles = [FORMATEUR_ROLE_ID, HS_ROLE_ID, ADMIN_ROLE_ID];
    if (
      !interaction.guild.members.cache
        .get(interaction.user.id)
        .roles.cache.some(role => roles.includes(role.id))
    ) {
      return await interaction.reply({
        content: "Vous n'avez pas la permission de faire cette commande !",
        ephemeral: true,
      });
    }
    const messageId = interaction.message.id;

    const formationUser: FORMATION = await FormationSchema.findOne({
      messageId: messageId,
    }).lean();
    if (formationUser) {
      const completedFormationIds = formationUser.formations.map(f => f._id);

      const formationNotDoneByUser = Formation.filter(
        formation => !completedFormationIds.includes(formation._id),
      );

      const options: { label: string; value: string }[] =
        formationNotDoneByUser.map(formation => ({
          label: formation.name,
          value: formation._id,
        }));
      const selectFormation = new StringSelectMenuBuilder()
        .setMinValues(1)
        .setMaxValues(1)
        .setCustomId('add_formation')
        .setPlaceholder('Choisissez une formation')
        .setOptions(options);

      const selectFormationRow: any = new ActionRowBuilder().addComponents(
        selectFormation,
      );

      await interaction.reply({
        content: 'Choisissez une formation',
        components: [selectFormationRow],
        ephemeral: true,
      });
      await wait(10000);
      await interaction.deleteReply();
    }
  },
};

export default button;
