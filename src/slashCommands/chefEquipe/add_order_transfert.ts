import { SlashCommand } from '../../types';
import {
  CommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import dayjs from 'dayjs';
import OrderOfTheDayModel, {
  ORDER_OF_THE_DAY,
} from '../../models/OrderOfTheDayModel';
import { generateEmbedOrderOfTheDay } from '../../cronjob/order_of_the_days';
import { channelMap } from '../../const/channelManager';
import { EntrepriseList } from '../../const/Entreprise';
import { typeTransfert } from './add_transfert';

export const command: SlashCommand = {
  name: 'addordertransfert',
  data: new SlashCommandBuilder()
    .setName('addordertransfert')
    .setDescription("Permet d'ajouter un transfert")
    .addStringOption(option =>
      option
        .setName('qui')
        .setDescription('Pour qui?')
        .setRequired(true)
        .addChoices(
          ...EntrepriseList.map(entreprise => ({
            name: entreprise.name,
            value: entreprise.name,
          })),
        ),
    )
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type de transfert')
        .setRequired(true)
        .addChoices(...typeTransfert),
    )
    .addStringOption(option =>
      option
        .setName('heure')
        .setDescription('Heure du transfert (format HHhMM)')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    const target = interaction.options.get('qui')?.value as string;
    const hour = interaction.options.get('heure')?.value as string;
    const type = interaction.options.get('type')?.value as string;

    const todayDateMidi = dayjs().hour(12).minute(0).second(0).millisecond(0);

    const mission = {
      target,
      hour,
      type,
    };

    const orderOfTheDay: ORDER_OF_THE_DAY =
      await OrderOfTheDayModel.findOneAndUpdate(
        {
          day: todayDateMidi.toDate(),
        },
        {
          $push: {
            missions: mission,
          },
        },
        { new: true },
      ).lean();

    if (!orderOfTheDay) {
      interaction.reply({
        content: "L'ordre du jour n'a pas été trouvé ! (Contact le Dev)",
        ephemeral: true,
      });
    }

    const newEmbed = generateEmbedOrderOfTheDay(orderOfTheDay.missions);

    const channel = interaction.guild.channels.cache.get(
      channelMap.get('ordre-du-jour'),
    ) as TextChannel;

    const message = await channel.messages.fetch(
      orderOfTheDay.embed_message_id,
    );

    await message.edit({ embeds: [newEmbed] });

    await interaction.reply({
      content: 'Le transfer à bien été ajouté !',
      ephemeral: true,
    });
  },
};
