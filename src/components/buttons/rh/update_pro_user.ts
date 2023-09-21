import { Buttons } from '../../../types'
const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js')
import UserSchema, { USER } from '../../../models/UserModel'
const dayjs = require('dayjs')
const { RH_ROLE_ID, ADMIN_ROLE_ID, HS_ROLE_ID } = process.env

export const button: Buttons = {
  data: {
    name: 'edit_pro_user',
  },
  execute: async interaction => {
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
    const channelId = interaction.channelId

    const user: USER = await UserSchema.findOne({
      rh_channel: channelId,
    }).lean()

    const modal = new ModalBuilder()
      .setTitle("Modifier les informations de l'utilisateur")
      .setCustomId('edit_pro_user')
    const weaponInput = new TextInputBuilder()
      .setCustomId('weapon')
      .setLabel('Matricule arme de service')
      .setValue(user.number_weapon?.toString() || '')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
    const hiringDate: string = user.hiringDate
      ? dayjs(user.hiringDate).format('DD/MM/YYYY') || ''
      : ''
    const hiringDateInput = new TextInputBuilder()
      .setCustomId('hiring-date')
      .setLabel("Date d'embauche")
      .setValue(hiringDate)
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder('DD/MM/YYYY')

    const lastMedicalVisit: string = user.last_medical_visit
      ? dayjs(user.last_medical_visit).format('DD/MM/YYYY') || ''
      : ''
    const lastMedicalVisitInput = new TextInputBuilder()
      .setCustomId('last-medical-visit')
      .setLabel('Date de la dernière visite médicale')
      .setValue(lastMedicalVisit)
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder('DD/MM/YYYY')

    const nextMedicalVisit: string = user.next_medical_visit
      ? dayjs(user.next_medical_visit).format('DD/MM/YYYY') || ''
      : ''
    const nextMedicalVisitInput = new TextInputBuilder()
      .setCustomId('next-medical-visit')
      .setLabel('Date de la prochaine visite médicale')
      .setValue(nextMedicalVisit)
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder('DD/MM/YYYY')

    const weaponRow = new ActionRowBuilder().addComponents(weaponInput)
    const hiringRow = new ActionRowBuilder().addComponents(hiringDateInput)
    const lastMedicalVisitRow = new ActionRowBuilder().addComponents(
      lastMedicalVisitInput,
    )
    const nextMedicalVisitRow = new ActionRowBuilder().addComponents(
      nextMedicalVisitInput,
    )

    modal.addComponents(
      hiringRow,
      weaponRow,
      lastMedicalVisitRow,
      nextMedicalVisitRow,
    )
    await interaction.showModal(modal)
  },
}

export default button
