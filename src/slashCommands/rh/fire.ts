import { SlashCommand } from '../../types';
import {
  CommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';

import UserSchema, { USER } from '../../models/UserModel';
import RhHistorySchema from '../../models/RhHistoryModel';
import dayjs from 'dayjs';
import { sendEmbedMessage } from './hire';
import { rolesMap } from '../../const/rolesManager';
import { channelMap } from '../../const/channelManager';

const wait = require('node:timers/promises').setTimeout;

export const command: SlashCommand = {
  name: 'fire',
  data: new SlashCommandBuilder()
    .setName('fire')
    .setDescription('Permet de renvoyé @')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à renvoyé')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('date')
        .setDescription('Date du renvoie')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    try {
      // check if the user is an array of role (RH, ADMIN, HS)
      const roles = [
        rolesMap.get('rh'),
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
      const memberUser = interaction.options.getUser('membre');
      const date = interaction.options.get('date').value?.toString();
      if (
        date &&
        !date.match(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/)
      ) {
        return await interaction.reply({
          content: 'Le format de la date est incorrect !',
        });
      }

      // remove all role except everyone

      await interaction.guild.members.cache
        .get(memberUser.id)
        .roles.remove(
          interaction.guild.members.cache
            .get(memberUser.id)
            .roles.cache.filter(
              role => role.id !== interaction.guild.roles.everyone.id,
            ),
        );

      const updatedBy = interaction.user.id;
      const updatedByNickname = (
        await interaction.guild.members.fetch(updatedBy)
      ).nickname;

      const channelUser: USER = await UserSchema.findOneAndUpdate(
        { discordId: memberUser.id },
        {
          isDeleted: true,
          updatedBy: updatedByNickname,
        },
        { new: true },
      ).lean();

      const findChannel = interaction.guild.channels.cache.find(
        chan => chan.id === channelUser.rh_channel && chan.isTextBased(),
      );
      await findChannel.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: rolesMap.get('rh'),
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: rolesMap.get('administrateur'),
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: rolesMap.get('head_security'),
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });

      // lastMedicalVisit: channelUser.last_medical_visit
      //   ? dayjs(channelUser.last_medical_visit).format('DD/MM/YYYY')
      //   : ' ',
      //   nextMedicalVisit: channelUser.next_medical_visit
      //   ? dayjs(channelUser.next_medical_visit).format('DD/MM/YYYY')
      //   : ' ',
      const user = await interaction.guild.members.fetch(channelUser.discordId);

      const newEmbed = await sendEmbedMessage(user.user, {
        name: channelUser.name,
        phone: channelUser.phone,
        accountNumber: channelUser.accountNumber,
        role: 'Licencié',
        pole: 'Licencié',
        number_weapon: channelUser.number_weapon?.toString(),
        hiringDate: channelUser.hiringDate
          ? dayjs(channelUser.hiringDate).format('DD/MM/YYYY')
          : ' ',
        updatedBy: updatedByNickname,
      });

      // const sentMessage = await channel.send({
      //   embeds: [embed.embed],
      //   components: [embed.row],
      // });
      // const embedId = sentMessage.id;

      await RhHistorySchema.create({
        discordId: memberUser.id,
        newRole: {
          _id: undefined,
          name: 'Licencié',
        },
        updatedBy: updatedByNickname,
      });

      let message;
      if (findChannel.isTextBased()) {
        message = await findChannel.messages.fetch(
          channelUser.embed_message_id_rh,
        );
      }

      const previousMessageFormation =
        await interaction.guild.channels.cache.get(
          channelMap.get('suivi-formation'),
        );

      if (previousMessageFormation.isTextBased) {
        const previousMessage = await (
          previousMessageFormation as TextChannel
        ).messages.fetch(channelUser.message_id_formation);
        await previousMessage.delete();
      }

      await message.edit({ embeds: [newEmbed.embed] });

      await UserSchema.deleteOne({ discordId: memberUser.id });

      await interaction.reply({
        content: 'Vous avez licencié cette personne!',
        ephemeral: true,
      });
      await wait(5000);
      await interaction.deleteReply();
    } catch (e) {
      console.error(e);
      await interaction.reply({
        content: 'An error occurred while processing the command.',
        ephemeral: true,
      });
    }
  },
};
