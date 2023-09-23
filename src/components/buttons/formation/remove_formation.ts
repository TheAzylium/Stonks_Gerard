import { Buttons } from '../../../types';
import { PermissionsBitField, StringSelectMenuBuilder } from 'discord.js';
import { Formation } from '../../../const/Formation';
import { ActionRowBuilder } from 'discord.js';
import { rolesMap } from '../../../const/rolesManager';
import UserSchema, { USER } from '../../../models/UserModel';
const wait = require('node:timers/promises').setTimeout;
require('dayjs');
export const button: Buttons = {
  data: {
    name: 'remove_formation',
  },
  execute: async interaction => {
    const roles = [
      rolesMap.get('formateur'),
      rolesMap.get('administrateur'),
      rolesMap.get('head_security'),
    ];
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (
      !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
      !member.roles.cache.some(role => roles.includes(role.id))
    ) {
      return await interaction.reply({
        content: "Vous n'avez pas la permission de faire cette commande !",
        ephemeral: true,
      });
    }
    const messageId = interaction.message.id;

    const formationUser: USER = await UserSchema.findOne({
      message_id_formation: messageId,
    }).lean();
    if (formationUser) {
      const completedFormationIds = formationUser.formations.map(f => f._id);

      const formationDoneByUser = Formation.filter(formation =>
        completedFormationIds.includes(formation._id),
      );

      const options: { label: string; value: string }[] =
        formationDoneByUser.map(formation => ({
          label: formation.name,
          value: formation._id,
        }));
      const selectFormation = new StringSelectMenuBuilder()
        .setMinValues(1)
        .setMaxValues(1)
        .setCustomId('remove_formation')
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
