import { Buttons } from '../../../types';
import { PermissionsBitField, StringSelectMenuBuilder } from 'discord.js';
import FormationSchema, { FORMATION } from '../../../models/FormatationModel';
import { ActionRowBuilder } from 'discord.js';
import { rolesMap } from '../../../const/rolesManager';
import { PosteList } from '../../../const/RolesList';
const wait = require('node:timers/promises').setTimeout;
require('dayjs');
export const button: Buttons = {
  data: {
    name: 'change_rank',
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

    const formationUser: FORMATION = await FormationSchema.findOne({
      messageId: messageId,
    }).lean();
    if (formationUser) {
      const selectRole = new StringSelectMenuBuilder()
        .setMinValues(1)
        .setMaxValues(1)
        .setCustomId('change_rank')
        .setPlaceholder('Choisissez un rôle')
        .setOptions(PosteList);

      const selectRoleRow: any = new ActionRowBuilder().addComponents(
        selectRole,
      );

      await interaction.reply({
        content: 'Choisissez une rôle',
        components: [selectRoleRow],
        ephemeral: true,
      });
      await wait(10000);
      await interaction.deleteReply();
    }
  },
};

export default button;
