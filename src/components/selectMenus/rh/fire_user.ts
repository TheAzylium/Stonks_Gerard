import { SelectMenu } from '../../../types'
import { PermissionsBitField, StringSelectMenuInteraction } from 'discord.js'
import UserSchema, { USER } from '../../../models/UserModel'
import RhHistorySchema from '../../../models/RhHistoryModel'
import dayjs from 'dayjs'
import { sendEmbedMessage } from '../../../slashCommands/rh/hiring'
dayjs.extend(require('dayjs/plugin/customParseFormat'))

const wait = require('node:timers/promises').setTimeout

export const modals: SelectMenu = {
  data: {
    name: 'fire_user',
  },
  execute: async (interaction: StringSelectMenuInteraction) => {
    if (interaction.values[0] === '2') {
      return await interaction.reply({
        content: 'Vous avez annuler le licenciement!',
        ephemeral: true,
      })
    } else {
      const updatedUser: USER = await UserSchema.findOneAndUpdate(
        { rh_channel: interaction.channelId },
        {
          isDeleted: true,
          updatedBy: interaction.user.id,
        },
        { new: true },
      ).lean()
      const updatedBy = (
        await interaction.guild.members.fetch(updatedUser.updatedBy)
      ).nickname

      const memberUser = await interaction.guild.members.fetch(
        updatedUser.discordId,
      )
      // remove all roles except @everyone
      await memberUser.roles.remove(
        memberUser.roles.cache.filter(
          role => role.id !== interaction.guild.roles.everyone.id,
        ),
      )

      // remove access to channel
      await interaction.channel.edit({
        permissionOverwrites: [
          { id: memberUser.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        ],
      })

      await RhHistorySchema.create({
        discordId: updatedUser.discordId,
        newRole: {
          _id: undefined,
          name: 'Licencié',
        },
        updatedBy,
      })

      const newEmbed = await sendEmbedMessage(memberUser.user, {
        name: updatedUser.name,
        phone: updatedUser.phone,
        accountNumber: updatedUser.accountNumber,
        role: 'Licencié',
        pole: 'Licencié',
        number_weapon: updatedUser.number_weapon?.toString(),
        hiringDate: updatedUser.hiringDate
          ? dayjs(updatedUser.hiringDate).format('DD/MM/YYYY')
          : ' ',
        lastMedicalVisit: updatedUser.last_medical_visit
          ? dayjs(updatedUser.last_medical_visit).format('DD/MM/YYYY')
          : ' ',
        nextMedicalVisit: updatedUser.next_medical_visit
          ? dayjs(updatedUser.next_medical_visit).format('DD/MM/YYYY')
          : ' ',
        updatedBy: updatedBy,
      })

      const message: any = await interaction.channel.messages.fetch(
        updatedUser.embed_message_id,
      )
      await message.edit({ embeds: [newEmbed.embed] })

      await interaction.reply({
        content: 'Vous avez licencié cette personne!',
        ephemeral: true,
      })
      await wait(5000)
      await interaction.deleteReply()
    }
  },
}

export default modals
