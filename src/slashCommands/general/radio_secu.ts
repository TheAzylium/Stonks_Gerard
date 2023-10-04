import { SlashCommand } from '../../types';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import { create_frequence, send_frequence } from '../../cronjob/radio';
import dayjs from 'dayjs';
import { capitalizeFirstLetter } from '../../cronjob/order_of_the_days';
import FrequenceOfTheDaySchema, {
  FREQUENCEOFTHEDAY,
} from '../../models/FrequenceOfTheDay';
import RadioSecuSchema from '../../models/RadioSecuModel';

export const command: SlashCommand = {
  name: 'radio_secu',
  data: new SlashCommandBuilder()
    .setName('radio_secu')
    .setDescription("Permet de redéfinir la radio d'urgence.")
    .addStringOption(option =>
      option
        .setName('frequence')
        .setDescription('La nouvelle fréquence (XXX.XX)')
        .setRequired(true),
    )
    .addBooleanOption(option =>
      option
        .setName('modifier_autres')
        .setDescription('Mettre à jour les autres fréquences ?')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    try {
      const frequence: string = interaction.options
        .get('frequence')
        .value?.toString();

      const updateOther: boolean =
        !!interaction.options.get('modifier_autres').value;

      // check if pattern of frequece is valid XXX.XX
      if (!/^\d{3}\.\d{2}$/.test(frequence)) {
        await interaction.reply({
          content: 'La fréquence doit être au format XXX.XX',
          ephemeral: true,
        });
        return;
      }
      const nicknameSender = (
        await interaction.guild.members.fetch(interaction.user.id)
      ).nickname;
      await RadioSecuSchema.create({
        frequence: frequence,
        updatedBy: nicknameSender,
      });

      const today = dayjs();
      const currentFrequenceOfTheDay: FREQUENCEOFTHEDAY =
        await FrequenceOfTheDaySchema.findOne({
          createdAt: {
            $lte: today
              .hour(23)
              .minute(59)
              .second(59)
              .millisecond(999)
              .toDate(),
            $gte: today.hour(0).minute(0).second(0).millisecond(0).toDate(),
          },
        }).lean();

      const newRadio = {
        security: frequence,
        interne: create_frequence(),
        transfert: create_frequence(),
      };

      if (!updateOther) {
        newRadio.interne =
          currentFrequenceOfTheDay?.interne || create_frequence();
        newRadio.transfert =
          currentFrequenceOfTheDay?.transfert || create_frequence();
      }

      const title = `Frequence radio du ${capitalizeFirstLetter(
        today.format('dddd'),
      )} ${today.format('DD/MM')} (Modifié à ${today.format('HH:mm')})`;

      const message = await send_frequence(interaction.client, newRadio, title);

      await FrequenceOfTheDaySchema.create({
        transfert: newRadio.transfert,
        interne: newRadio.interne,
        security: newRadio.security,
        embedId: message,
      });

      await interaction.reply({
        content: 'La fréquence a bien été modifiée !',
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
