import { SlashCommand } from '../../types';
import {
  CommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
  Role,
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

function decimalToHexColor(decimalColor: number): string {
  const red = (decimalColor >> 16) & 0xff;
  const green = (decimalColor >> 8) & 0xff;
  const blue = decimalColor & 0xff;

  return (
    '#' +
    ((1 << 24) | (red << 16) | (green << 8) | blue)
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
}
async function getRoleMembersInfo(
  interaction,
  members,
  roleKey: string,
  title: string,
): Promise<EmbedBuilder | undefined> {
  const guild = interaction.guild;
  if (!guild) return;

  const roleID = rolesMap.get(roleKey);
  if (!roleID) return;

  const role = guild.roles.cache.get(roleID);
  if (!role) return;

  const roleMembers = members.filter(member => member.roles.cache.has(role.id));
  const memberDataPromises = roleMembers.map(member =>
    UserSchema.findOne({ discordId: member.id })
      .select('discordId name phone pole')
      .lean(),
  );
  const memberData = await Promise.all(memberDataPromises);
  let embedFields = [];
  if (
    memberData &&
    memberData.length &&
    !memberData.every(item => item === null)
  ) {
    embedFields = memberData.map(data => ({
      name: data?.name,
      value: `${data?.phone}` + (data?.pole?.id ? ` @${data.pole.id}` : ''),
    }));
  }
  const embed = new EmbedBuilder()
    .setColor(decimalToHexColor(role.color) as any)
    .setTitle(title);
  if (embedFields) {
    embed.setFields(embedFields);
  }
  return embed;
}

async function fetchAndSendOrUpdateEmbed(
  interaction: any, // use the appropriate type
  members: any, // use the appropriate type
  roleKey: string,
  title: string,
  messageAnnuaire: any, // use the appropriate type
  annuaireChannel: any, // use the appropriate type
): Promise<void> {
  const embed = await getRoleMembersInfo(interaction, members, roleKey, title);
  const targetMessage = messageAnnuaire.find(
    message => message.embeds.length > 0 && message.embeds[0].title === title,
  );
  if (targetMessage) {
    await targetMessage.edit({ embeds: [embed] });
  } else {
    await annuaireChannel.send({ embeds: [embed] });
  }
}
export const command: SlashCommand = {
  name: 'update_contact',
  data: new SlashCommandBuilder()
    .setName('update_contact')
    .setDescription("Permet de mettre à jour l'annuaire des contacts"),
  execute: async (interaction: CommandInteraction) => {
    try {
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

      const annuaireChannel = interaction.guild?.channels.cache.get(
        channelMap.get('annuaire') as string,
      ) as TextChannel;
      const members = await interaction.guild.members.fetch();
      const messageAnnuaire = await annuaireChannel.messages.fetch();

      const listRoles = [
        {
          roleKey: 'head_security',
          title: 'Head Security',
        },
        {
          roleKey: 'administrateur',
          title: 'Administrateur',
        },
        {
          roleKey: 'chef_dequipe',
          title: "Chef d'équipe",
        },
        {
          roleKey: 'senior',
          title: 'Senior',
        },
        // {
        //   roleKey: 'confirme',
        //   title: 'Confirmé',
        // },
        {
          roleKey: 'junior',
          title: 'Junior',
        },
        {
          roleKey: 'formation',
          title: 'Formation',
        },
      ];

      for (const role of listRoles) {
        setTimeout(async () => {
          await fetchAndSendOrUpdateEmbed(
            interaction,
            members,
            role.roleKey,
            role.title,
            messageAnnuaire,
            annuaireChannel,
          );
        }, 2000);
      }
      // await fetchAndSendOrUpdateEmbed(
      //   interaction,
      //   members,
      //   'head_security',
      //   'Head Security',
      //   messageAnnuaire,
      //   annuaireChannel,
      // );
      // await fetchAndSendOrUpdateEmbed(
      //   interaction,
      //   members,
      //   'administrateur',
      //   'Administrateur',
      //   messageAnnuaire,
      //   annuaireChannel,
      // );
      // await fetchAndSendOrUpdateEmbed(
      //   interaction,
      //   members,
      //   'chef_dequipe',
      //   "Chef d'équipe",
      //   messageAnnuaire,
      //   annuaireChannel,
      // );
      //
      // await fetchAndSendOrUpdateEmbed(
      //   interaction,
      //   members,
      //   'senior',
      //   'Senior',
      //   messageAnnuaire,
      //   annuaireChannel,
      // );
      //
      // await fetchAndSendOrUpdateEmbed(
      //   interaction,
      //   members,
      //   'confirmee',
      //   'Confirmé(e)',
      //   messageAnnuaire,
      //   annuaireChannel,
      // );
      //
      // await fetchAndSendOrUpdateEmbed(
      //   interaction,
      //   members,
      //   'junior',
      //   'Junior',
      //   messageAnnuaire,
      //   annuaireChannel,
      // );
      //
      // await fetchAndSendOrUpdateEmbed(
      //   interaction,
      //   members,
      //   'formation',
      //   'Formation',
      //   messageAnnuaire,
      //   annuaireChannel,
      // );

      return await interaction.reply({
        content: 'Command not implemented yet',
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
