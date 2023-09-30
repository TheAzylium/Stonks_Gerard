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

export const command: SlashCommand = {
  name: 'addordersecurity',
  data: new SlashCommandBuilder()
    .setName('addordersecurity')
    .setDescription("Permet d'ajouter un evenement de sécurité")
    .addStringOption(option =>
      option.setName('qui').setDescription('Pour qui?').setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('ou')
        .setDescription("Ou se passe l'evenement")
        .setRequired(true),
    )
    .addNumberOption(option =>
      option
        .setName('agent')
        .setDescription("Nombre d'agent")
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('heure')
        .setDescription('Heure du transfert (format HHhMM)')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    const target = interaction.options.get('qui')?.value as string;
    const nbrAgent = interaction.options.get('agent')?.value as number;
    const hour = interaction.options.get('heure')?.value as string;
    const where = interaction.options.get('ou')?.value as string;

    const todayDateMidi = dayjs().hour(12).minute(0).second(0).millisecond(0);

    const mission = {
      target,
      nbrAgent,
      hour,
      where,
      type: 'SECURITY',
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
      content: "L'evenement a bien été ajouté !",
      ephemeral: true,
    });
  },
};
