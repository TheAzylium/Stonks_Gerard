import { SlashCommand } from '../../types';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EntrepriseList } from '../../const/Entreprise';
import dayjs from 'dayjs';
import OrderOfTheDaySchema, {
  ORDER_OF_THE_DAY,
} from '../../models/OrderOfTheDayModel';

export const command: SlashCommand = {
  name: 'addsaisie',
  data: new SlashCommandBuilder()
    .setName('addsaisie')
    .setDescription("Permet d'ajouter une saisie")
    .addStringOption(option =>
      option
        .setName('entreprise')
        .setDescription('Entreprise de la saisie')
        .setRequired(true)
        .addChoices(
          ...EntrepriseList.filter(entreprise => entreprise.saisie).map(
            entreprise => ({
              name: entreprise.name,
              value: entreprise.accronyme,
            }),
          ),
        ),
    )
    .addStringOption(option =>
      option
        .setName('jour')
        .setDescription('Jour de la saisie (format JJ/MM/YYYY)')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('heure')
        .setDescription('Heure de la saisie (format HH:MM)')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    const entreprise = interaction.options.get('entreprise').value;
    const jour: string = interaction.options.get('jour').value.toString();
    const heure: string = interaction.options.get('heure').value.toString();

    // check format jour
    if (
      jour &&
      !jour.match(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/)
    ) {
      return await interaction.reply({
        content: 'Le format du jour est incorrect !',
      });
    }
    if (heure && !heure.match(/^([01]\d|2[0-3]):?([0-5]\d)$/)) {
      return await interaction.reply({
        content: "Le format de l'heure est incorrect !",
      });
    }

    const startDate = dayjs(
      dayjs(jour, 'DD/MM/YYYY').toDate().setHours(0, 0, 0, 0),
    ).toISOString();
    const endDate = dayjs(
      dayjs(jour, 'DD/MM/YYYY').toDate().setHours(23, 59, 59, 999),
    ).toISOString();

    const OrderOfTheDay: ORDER_OF_THE_DAY = await OrderOfTheDaySchema.findOne({
      day: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    if (OrderOfTheDay) {
      const isHourAlreadyTaken = OrderOfTheDay.missions.some(mission => {
        return mission.hour === heure;
      });
      if (isHourAlreadyTaken) {
        return await interaction.reply({
          content: "L'heure est déjà prise !",
        });
      }
    }

    let updateOrderOfTheDay;
    if (!OrderOfTheDay) {
      updateOrderOfTheDay = await OrderOfTheDaySchema.create({
        day: dayjs(jour, 'DD/MM/YYYY').toDate().setHours(12, 30, 60, 500),
        missions: [
          {
            target: entreprise,
            type: 'SAISIE',
            hour: heure,
          },
        ],
      });
    } else {
      updateOrderOfTheDay = await OrderOfTheDaySchema.findOneAndUpdate(
        {
          _id: OrderOfTheDay._id,
        },
        {
          $push: {
            missions: {
              target: entreprise,
              type: 'SAISIE',
              hour: heure,
            },
          },
        },
      ).lean();
    }

    interaction.reply({
      content: 'En cours de dev',
    });
  },
};
