import { Buttons } from '../../../types';
import { StringSelectMenuBuilder } from 'discord.js';
const { ActionRowBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { ADMIN_ROLE_ID, HS_ROLE_ID } = process.env;
require('dayjs');
export const button: Buttons = {
  data: {
    name: 'fire_user',
  },
  execute: async interaction => {
    const roles = [ADMIN_ROLE_ID, HS_ROLE_ID];
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

    const menu = new StringSelectMenuBuilder()
      .setMinValues(1)
      .setMaxValues(1)
      .setCustomId('fire_user')
      .setPlaceholder('Oui/Non')
      .setOptions([
        { label: 'Oui', value: '1' },
        { label: 'Non', value: '2' },
      ]);

    await interaction.reply({
      content: 'Etes vous sur de vouloir virer cette personne',
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true,
    });
    await wait(10000);
    await interaction.deleteReply();
  },
};

export default button;
