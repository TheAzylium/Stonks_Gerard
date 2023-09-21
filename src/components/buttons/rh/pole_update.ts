import { Buttons } from '../../../types'
import { StringSelectMenuBuilder } from 'discord.js'
import { PoleList } from '../../../const/PolesList'
const { ActionRowBuilder } = require('discord.js')
const wait = require('node:timers/promises').setTimeout
const { RH_ROLE_ID, ADMIN_ROLE_ID, HS_ROLE_ID } = process.env
require('dayjs')
export const button: Buttons = {
  data: {
    name: 'edit_pole_user',
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

    const menu = new StringSelectMenuBuilder()
      .setMinValues(1)
      .setMaxValues(1)
      .setCustomId('poles_update')
      .setPlaceholder('Choisissez un poste')
      .setOptions(PoleList)

    await interaction.reply({
      content: 'Choisissez un poste',
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true,
    })
    await wait(10000)
    await interaction.deleteReply()
  },
}

export default button
