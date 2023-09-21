import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import { SlashCommand } from '../../types'
import dayjs from 'dayjs'
dayjs.extend(require('dayjs/plugin/customParseFormat'))
import RhHistorySchema, { RHHISTORY } from '../../models/RhHistoryModel'

const { RH_ROLE_ID, ADMIN_ROLE_ID, HS_ROLE_ID } = process.env
export const command: SlashCommand = {
  name: 'historyrh',
  data: new SlashCommandBuilder()
    .setName('historyrh')
    .setDescription("Permet de voir l'historique des recrutements RH.")
    .addStringOption(option =>
      option
        .setName('date')
        .setDescription("Date maximum d'historique sous la forme DD/MM/YYYY")
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
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

    const date: string = interaction.options.get('date').value?.toString()
    if (date && !date.match(/\d{2}[/]\d{2}[/]\d{4}/)) {
      return await interaction.reply({
        content: 'La date doit être au format DD/MM/YYYY !',
        ephemeral: true,
      })
    }
    const dateFormated = dayjs(date, 'DD/MM/YYYY').toDate()

    const history: RHHISTORY[] = await RhHistorySchema.find({
      createdAt: { $gte: dateFormated },
    }).lean()

    // split pour avoir max 25 fields sachant que j'ai trois entré par history

    const embeds: EmbedBuilder[] = []

    const historySplitted = splitArray(history, 3, 25)

    historySplitted.forEach((hist, index) => {
      const embed = new EmbedBuilder()
        .setTitle('Historique des recrutements RH')
        .setColor('#00ff00')
        .setFooter({ text: `Page ${index + 1}/${historySplitted.length}` })
        .setTimestamp()
      hist.forEach((recrutement: RHHISTORY) => {
        embed
          .addFields({
            name: 'Qui',
            value: `<@${recrutement.discordId}>`,
            inline: true,
          })
          .addFields({
            name: 'Quand',
            value: dayjs(recrutement.createdAt).format('DD/MM/YYYY'),
            inline: true,
          })
          .addFields({
            name: 'Role',
            value: recrutement.newRole.name,
            inline: true,
          })
      })
      embeds.push(embed)
    })

    await interaction.reply({ embeds: [...embeds] })
  },
}

const splitArray = (arr, objSize = 3, maxElements = 25) => {
  const maxObjsPerSubArray = Math.floor(maxElements / objSize)
  const result = []

  for (let i = 0; i < arr.length; i += maxObjsPerSubArray) {
    result.push(arr.slice(i, i + maxObjsPerSubArray))
  }
  return result
}
