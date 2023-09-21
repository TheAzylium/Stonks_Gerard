import { SlashCommand } from '../../types';
import {
  SlashCommandBuilder,
  ChannelType,
  PermissionsBitField,
  User,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  TextChannel,
  CommandInteraction,
} from 'discord.js';

import UserSchema, { USER } from '../../models/UserModel';
import RhHistorySchema from '../../models/RhHistoryModel';
import dayjs from 'dayjs';
import { sendEmbedMessage } from './hire';

const { RH_ROLE_ID, ADMIN_ROLE_ID, HS_ROLE_ID } = process.env;

const wait = require('node:timers/promises').setTimeout;

export const command: SlashCommand = {
  name: 'fire',
  data: new SlashCommandBuilder()
    .setName('fire')
    .setDescription('Permet de renvoyé le mec @')
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
      const roles = [RH_ROLE_ID, ADMIN_ROLE_ID, HS_ROLE_ID];
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

      const name = (await interaction.guild.members.fetch(memberUser.id))
        .nickname;
      const updatedBy = interaction.user.id;
      const nickNameUpdatedBy = (
        await interaction.guild.members.fetch(updatedBy)
      ).nickname;

      const channelUser: USER = await UserSchema.findOneAndUpdate(
        { discordId: memberUser.id },
        {
          isDeleted: true,
          updatedBy,
        },
        { new: true },
      ).lean();

      const findChannel = interaction.guild.channels.cache.find(
        chan => chan.id === channelUser.rh_channel && chan.isTextBased(),
      );
      await findChannel.edit({
        permissionOverwrites: [
          { id: memberUser.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        ],
      });

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
        lastMedicalVisit: channelUser.last_medical_visit
          ? dayjs(channelUser.last_medical_visit).format('DD/MM/YYYY')
          : ' ',
        nextMedicalVisit: channelUser.next_medical_visit
          ? dayjs(channelUser.next_medical_visit).format('DD/MM/YYYY')
          : ' ',
        updatedBy: updatedBy,
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
        updatedBy: updatedBy,
      });

      let message;
      if (findChannel.isTextBased()) {
        message = await findChannel.messages.fetch(
          channelUser.embed_message_id,
        );
      }

      await message.edit({ embeds: [newEmbed.embed] });

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
