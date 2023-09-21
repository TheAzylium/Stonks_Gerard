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
  name: 'mtp',
  data: new SlashCommandBuilder()
    .setName('mtp')
    .setDescription('Permet de déclarer le remplissage MTP.')
    .addNumberOption(option =>
      option
        .setName('litre')
        .setDescription("Nombre de litre d'essence")
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
      const litre: number = parseInt(
        interaction.options.get('litre').value?.toString(),
      );

      if (litre < 0) {
        return await interaction.reply({
          content: 'Le nombre de litre doit être positif !',
          ephemeral: true,
        });
      }

      const channel = interaction.guild.channels.cache.get(
        channelMap.get('suivi-activite'),
      ) as TextChannel;

      const message = await channel.send(
        `⛽ Livraison MTP : Remplissage de la cuve - ${litre}L`,
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
          name: 'MTP',
          number: litre,
        },
      }).save();
      await interaction.reply({
        content: 'Le remplissage MTP a bien été déclaré !',
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
