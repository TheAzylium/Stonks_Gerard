import { SlashCommand } from '../../types';
import {
  CommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';

import ActivityMonitoringSchema from '../../models/MonitoringActivityModel';
import { rolesMap } from '../../const/rolesManager';
import { channelMap } from '../../const/channelManager';

export const command: SlashCommand = {
  name: 'pawl',
  data: new SlashCommandBuilder()
    .setName('pawl')
    .setDescription('Permet de déclarer une livraison PAWL.')
    .addNumberOption(option =>
      option
        .setName('nombre')
        .setDescription('Nombre de feuille')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    try {
      if (
        !interaction.guild.members.cache
          .get(interaction.user.id)
          .roles.cache.some(role => role.id === rolesMap.get('agent'))
      ) {
        return await interaction.reply({
          content: "Vous n'avez pas la permission de faire cette commande !",
          ephemeral: true,
        });
      }
      const nombre: number = parseInt(
        interaction.options.get('nombre').value?.toString(),
      );

      if (nombre < 0) {
        return await interaction.reply({
          content: 'Le nombre doit être positif !',
          ephemeral: true,
        });
      }

      const channel = interaction.guild.channels.cache.get(
        channelMap.get('suivi-activite'),
      ) as TextChannel;

      const message = await channel.send(
        `📰 Livraison PAWL : ${nombre} feuilles`,
      );

      const nicknameSender = (
        await interaction.guild.members.fetch(interaction.user.id)
      ).nickname;

      await new ActivityMonitoringSchema({
        messageId: message.id,
        sendBy: {
          _id: interaction.user.id,
          name: nicknameSender,
        },
        activity: {
          name: 'PAWL',
          number: 0,
        },
      }).save();
      await interaction.reply({
        content: 'La livraison PAWL a bien été déclaré !',
        ephemeral: true,
      });
    } catch (e) {
      console.error(e);
      await interaction.reply({
        content: 'An error occurred while processing the command.',
        ephemeral: true,
      });
    }
  },
};
