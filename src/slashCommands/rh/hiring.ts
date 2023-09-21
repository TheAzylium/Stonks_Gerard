import { SlashCommand } from '../../types'
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
} from 'discord.js'

import UserSchema from '../../models/UserModel'
import RhHistorySchema from '../../models/RhHistoryModel'

const {
  MAN_ID,
  WOMAN_ID,
  AGENT_ROLE_ID,
  STAGIAIRE_ROLE_ID,
  RH_CATEGORY_ID,
  RH_ROLE_ID,
  ADMIN_ROLE_ID,
  HS_ROLE_ID,
} = process.env

export const command: SlashCommand = {
  name: 'hiring',
  data: new SlashCommandBuilder()
    .setName('hiring')
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
      const roles = [RH_ROLE_ID, ADMIN_ROLE_ID, HS_ROLE_ID]
      if (
        !interaction.guild.members.cache
          .get(interaction.user.id)
          .roles.cache.some(role => roles.includes(role.id))
      ) {
        return await interaction.reply({
          content: "Vous n'avez pas la permission de faire cette commande !",
          ephemeral: true,
        })
      }
      const memberUser: User = interaction.options.getUser('membre')
      const genderRole = interaction.options.get('sexe').role
      if (![MAN_ID, WOMAN_ID].includes(genderRole.id)) {
        return await interaction.reply({
          content: 'Le sexe doit être un homme ou une femme !',
          ephemeral: true,
        })
      }
      await interaction.guild.members.cache
        .get(memberUser.id)
        .roles.add([genderRole.id, AGENT_ROLE_ID, STAGIAIRE_ROLE_ID])
      const name = (await interaction.guild.members.fetch(memberUser.id))
        .nickname
      const channelName = genderRole.id === MAN_ID ? `👨•${name}` : `👩•${name}`
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: RH_CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          { id: memberUser.id, allow: [PermissionsBitField.Flags.ViewChannel] },
          { id: RH_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
          { id: ADMIN_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
          { id: HS_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
        ],
      })

      const updatedBy = interaction.user.id
      const nickNameUpdatedBy = (
        await interaction.guild.members.fetch(updatedBy)
      ).nickname

      const embed = await sendEmbedMessage(memberUser, {
        name: name,
        updatedBy: nickNameUpdatedBy,
      })
      const sentMessage = await channel.send({
        embeds: [embed.embed],
        components: [embed.row],
      })
      const embedId = sentMessage.id

      await RhHistorySchema.create({
        discordId: memberUser.id,
        newRole: {
          _id: process.env.STAGIAIRE_ROLE_ID,
          name: 'En Formation',
        },
        updatedBy: updatedBy,
      })

      await createUserSchema(
        memberUser,
        channel,
        name,
        embedId,
        genderRole.id,
        interaction.user.id,
      )

      await interaction.reply({
        content: `Le channel ${channel} a été créé !`,
      })
    } catch (e) {
      console.error(e)
      await interaction.reply({
        content: 'An error occurred while processing the command.',
        ephemeral: true,
      })
    }
  },
}

async function createUserSchema(
  memberUser: User,
  channel: TextChannel,
  name: string,
  embedId: string,
  sex: string,
  createdBy?: string,
) {
  return await UserSchema.create({
    discordId: memberUser.id,
    rh_channel: channel.id,
    embed_message_id: embedId,
    name: name,
    phone: undefined,
    hiringDate: undefined,
    accountNumber: undefined,
    role: undefined,
    sex: sex,
    pole: {
      _id: undefined,
      pole: 'Opérationnel',
    },
    number_weapon: undefined,
    last_medical_visit: undefined,
    updatedBy: createdBy,
  })
}

export async function sendEmbedMessage(
  memberUser: User,
  content: {
    name?: string
    phone?: string
    hiringDate?: string
    accountNumber?: string
    role?: string
    pole?: string
    number_weapon?: string
    lastMedicalVisit?: string
    nextMedicalVisit?: string
    updatedBy?: string
  } = {
    name: ' ',
    phone: ' ',
    hiringDate: ' ',
    accountNumber: ' ',
    role: ' ',
    pole: ' ',
    number_weapon: ' ',
    lastMedicalVisit: ' ',
    nextMedicalVisit: ' ',
    updatedBy: ' ',
  },
) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: 'Gerard' })
    .setTitle('Bienvenue dans ton espace RH !')
    .addFields(
      { name: 'Nom', value: content.name || ' ', inline: true },
      { name: 'Téléphone', value: content.phone || ' ', inline: true },
      { name: 'Date Embauche', value: content.hiringDate || ' ' },
      { name: 'Numéro de compte', value: content.accountNumber || ' ' },
      { name: 'Poste', value: content.role || ' ' },
      { name: 'Pôle ', value: content.pole || ' ' },
      { name: 'Matricule arme', value: content.number_weapon || ' ' },
      {
        name: 'Dernière visite médicale',
        value: content.lastMedicalVisit || ' ',
        inline: true,
      },
      {
        name: 'Prochaine visite médicale',
        value: content.nextMedicalVisit || ' ',
        inline: true,
      },
    )
    .setThumbnail(memberUser.displayAvatarURL())
    .setColor('#8EFF55')
    .setFooter({ text: `Mis à jour par ${content.updatedBy}` })

  const row: any = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel('Modifier les informations personel')
      .setCustomId('edit_perso_user'),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setLabel('Modifier les informations professionnel')
      .setCustomId('edit_pro_user'),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Modifier le poste')
      .setCustomId('edit_role_user'),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Modifier le pole')
      .setCustomId('edit_pole_user'),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel('Licencier')
      .setCustomId('fire_user'),
  )
  return { embed, row }
}
