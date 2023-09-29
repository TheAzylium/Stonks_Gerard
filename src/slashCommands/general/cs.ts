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
  name: 'cs',
  data: new SlashCommandBuilder()
    .setName('cs')
    .setDescription('Permet de déclarer un colis sécurisé.')
    .addNumberOption(option =>
      option
        .setName('heure')
        .setDescription('Sous le format HHhMM')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    try {
      const roles = [
        rolesMap.get('senior'),
        rolesMap.get('chef_dequipe'),
        rolesMap.get('administrateur'),
        rolesMap.get('head_security'),
      ];

      const member = interaction.guild.members.cache.get(interaction.user.id);

      if (!member.roles.cache.some(role => roles.includes(role.id))) {
        return await interaction.reply({
          content: "Vous n'avez pas la permission de faire cette commande !",
          ephemeral: true,
        });
      }

      const heure: number = parseInt(
        interaction.options.get('heure').value?.toString(),
      );

      // check if heure is good pattern
      if (heure && !heure.toString().match(/^[0-9]{1,2}h[0-9]{1,2}$/)) {
        return await interaction.reply({
          content: "Le format de l'heure est incorrect !",
          ephemeral: true,
        });
      }

      const channel = interaction.guild.channels.cache.get(
        channelMap.get('suivi-activite'),
      ) as TextChannel;

      const message = await channel.send(`🛅 Conteneur sécurisé à ${heure} 🛅`);

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
          name: 'CS',
          number: 0,
        },
      }).save();
      await interaction.reply({
        content: 'Le conteneur sécurisé à bien été déclarer !',
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
