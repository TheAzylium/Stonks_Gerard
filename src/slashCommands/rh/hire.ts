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
  AttachmentBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

import UserSchema from '../../models/UserModel';
import RhHistorySchema from '../../models/RhHistoryModel';
import { rolesMap } from '../../const/rolesManager';
import { channelMap } from '../../const/channelManager';
import dayjs from 'dayjs';

export const command: SlashCommand = {
  name: 'hire',
  data: new SlashCommandBuilder()
    .setName('hire')
    .setDescription('Permet de recruter le mec @ et créer son espace RH.')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à recruter')
        .setRequired(true),
    )
    .addRoleOption(option =>
      option.setName('sexe').setDescription('Sexe du membre').setRequired(true),
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
      const memberUser: User = interaction.options.getUser('membre');
      const nicknameTarget = (
        await interaction.guild.members.fetch(memberUser.id)
      ).nickname;
      const checkUserAlreadyExist = await UserSchema.findOne({
        discordId: memberUser.id,
      })
        .select('_id')
        .lean();
      if (checkUserAlreadyExist) {
        return await interaction.reply({
          content: 'Cet utilisateur existe déjà !',
          ephemeral: true,
        });
      }
      const genderRole = interaction.options.get('sexe').role;
      if (
        ![rolesMap.get('homme'), rolesMap.get('femme')].includes(genderRole.id)
      ) {
        return await interaction.reply({
          content: 'Le sexe doit être un homme ou une femme !',
          ephemeral: true,
        });
      }
      await interaction.guild.members.cache
        .get(memberUser.id)
        .roles.add([
          genderRole.id,
          rolesMap.get('agent'),
          rolesMap.get('formation'),
        ]);
      const name = (await interaction.guild.members.fetch(memberUser.id))
        .nickname;
      const channelName =
        genderRole.id === rolesMap.get('homme') ? `👨・${name}` : `👩・${name}`;
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: channelMap.get('espace_rh'),
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          { id: memberUser.id, allow: [PermissionsBitField.Flags.ViewChannel] },
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

      const updatedBy = interaction.user.id;
      const nickNameUpdatedBy = (
        await interaction.guild.members.fetch(updatedBy)
      ).nickname;

      const embedClassic = await sendEmbedMessage(memberUser, {
        name: name,
        updatedBy: nickNameUpdatedBy,
      });

      const embedMedialVisit = new EmbedBuilder()
        .setTitle('Visite médicale')
        .setColor('#8EFF55')
        .addFields(
          {
            name: 'Dernière visite médicale',
            value: ' ',
            inline: true,
          },
          {
            name: 'Prochaine visite médicale',
            value: ' ',
            inline: true,
          },
        )
        .setFooter({
          text: `Mis à jour par ${nickNameUpdatedBy} le ${dayjs(
            new Date(),
          ).format('DD/MM/YYYY à HH:mm')}`,
        });

      const hireImage = new AttachmentBuilder('src/assets/hire.png');
      await channel.send({
        files: [hireImage],
      });
      const sentMessageClassic = await channel.send({
        embeds: [embedClassic.embed, embedMedialVisit],
        components: [embedClassic.selecRow],
      });

      const embedClassicId = sentMessageClassic.id;

      await RhHistorySchema.create({
        discordId: memberUser.id,
        newRole: {
          _id: rolesMap.get('formation'),
          name: 'En Formation',
        },
        updatedBy: updatedBy,
      });

      const row: ActionRowBuilder = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('add_formation')
          .setLabel('Ajouter une formation')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('remove_formation')
          .setLabel('Retirer une formation')
          .setStyle(ButtonStyle.Danger),
      );

      const message = await (
        interaction.guild.channels.cache.get(
          channelMap.get('suivi-formation'),
        ) as TextChannel
      ).send({
        content: `__En formation__ :  **${nicknameTarget}** 📞555-XXXX📞`,
        components: [row as any],
      });

      await createUserSchema({
        memberUser,
        channel,
        name,
        embedId: embedClassicId,
        sex: genderRole.id,
        messageId: message.id,
        createdBy: interaction.user.id,
      });

      await interaction.reply({
        content: `Le channel ${channel} a été créé !`,
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

async function createUserSchema({
  memberUser,
  channel,
  name,
  embedId,
  sex,
  messageId,
  createdBy,
}) {
  return await UserSchema.create({
    discordId: memberUser.id,
    rh_channel: channel.id,
    embed_message_id_rh: embedId,
    message_id_formation: messageId,
    name: name,
    phone: undefined,
    hiringDate: undefined,
    accountNumber: undefined,
    role: {
      _id: rolesMap.get('formation'),
      name: 'Formation',
    },
    sex: sex,
    pole: {
      _id: undefined,
      pole: 'Opérationnel',
    },
    number_weapon: undefined,
    last_medical_visit: undefined,
    updatedBy: createdBy,
    formations: [],
  });
}

export async function sendEmbedMessage(
  memberUser: User,
  content: {
    name?: string;
    phone?: string;
    hiringDate?: string;
    accountNumber?: string;
    role?: string;
    pole?: string;
    number_weapon?: string;
    // lastMedicalVisit?: string;
    // nextMedicalVisit?: string;
    updatedBy?: string;
    updatedAt?: Date;
  } = {
    name: ' ',
    phone: ' ',
    hiringDate: ' ',
    accountNumber: ' ',
    role: ' ',
    pole: ' ',
    number_weapon: ' ',
    updatedBy: ' ',
    updatedAt: new Date(),
  },
) {
  const embed = new EmbedBuilder()
    .setTitle('Bienvenue dans ton espace RH !')
    .addFields(
      { name: 'Nom', value: content.name || ' ', inline: true },
      { name: 'Téléphone', value: content.phone || ' ', inline: true },
      { name: 'Date Embauche', value: content.hiringDate || ' ' },
      { name: 'Numéro de compte', value: content.accountNumber || ' ' },
      { name: 'Poste', value: content.role || ' ' },
      { name: 'Pôle ', value: content.pole || ' ' },
      { name: 'Matricule arme', value: content.number_weapon || ' ' },
    )
    .setColor('#8EFF55')
    .setFooter({
      text: `Mis à jour par ${content.updatedBy} le ${dayjs(
        content.updatedAt,
      ).format('DD/MM/YYYY à HH:mm')}`,
    });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('user_action')
    .setMaxValues(1)
    .setMinValues(1)
    .setOptions([
      {
        label: 'RH - Modifier les informations personnelles',
        value: 'edit_perso_user',
      },
      {
        label: 'RH - Modifier les informations professionnelles',
        value: 'edit_pro_user',
      },
      {
        label: 'RH - Modifier le poste',
        value: 'edit_role_user',
      },
      {
        label: 'RH - Modifier le pôle',
        value: 'edit_pole_user',
      },
      {
        label: 'Poser des congés',
        value: 'ask_holidays',
      },
    ]);

  const selecRow: any = new ActionRowBuilder().addComponents(selectMenu);

  const row: any = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel('Modifier les informations personelles')
      .setCustomId('edit_perso_user'),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setLabel('Modifier les informations professionnelles')
      .setCustomId('edit_pro_user'),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Modifier le poste')
      .setCustomId('edit_role_user'),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Modifier le pole')
      .setCustomId('edit_pole_user'),
  );
  return { embed, row, selecRow };
}
