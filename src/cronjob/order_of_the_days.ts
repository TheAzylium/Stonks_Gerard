import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { channelMap } from '../const/channelManager';
import dayjs from 'dayjs';
import OrderOfTheDay, { ORDER_OF_THE_DAY } from '../models/OrderOfTheDayModel';

require('dayjs/locale/fr');

dayjs.locale('fr');
export async function order_of_the_days(client: Client) {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  if (!guild) return console.log('❌ Guild not found');

  let channel = guild.channels.cache.get(
    channelMap.get('ordre-du-jour'),
  ) as TextChannel;
  if (!channel) {
    const channelList = await guild.channels.fetch();
    channel = channelList.find(
      channel => channel.id === channelMap.get('ordre-du-jour'),
    ) as TextChannel;
  }
  const messageList = await channel?.messages.fetch({ limit: 100 });

  const today = dayjs();
  const todayMidi = dayjs().hour(12).minute(0).second(0).millisecond(0);

  const embedMessage = messageList?.find(message => {
    const embed = message.embeds[0];
    if (!embed) return false;
    return (
      embed.title ===
      `Ordre du jour ${capitalizeFirstLetter(
        today.format('dddd'),
      )} ${today.format('DD/MM')}`
    );
  });

  if (!embedMessage) {
    const embedMessage = generateEmbedOrderOfTheDay();
    const message = await channel.send({ embeds: [embedMessage] });

    const orderOfTheDay: ORDER_OF_THE_DAY = await OrderOfTheDay.findOne({
      day: todayMidi.toDate(),
    }).lean();
    if (!orderOfTheDay) {
      await OrderOfTheDay.create({
        day: todayMidi.toDate(),
        embed_message_id: message.id,
      });
    } else {
      await OrderOfTheDay.updateOne(
        { day: todayMidi.toDate() },
        { embed_message_id: message.id },
      );
    }
  } else {
    const orderOfTheDay: ORDER_OF_THE_DAY = await OrderOfTheDay.findOne({
      day: todayMidi.toDate(),
    }).lean();
    if (!orderOfTheDay) {
      await OrderOfTheDay.create({
        day: todayMidi.toDate(),
        embed_message_id: embedMessage.id,
      });
    } else {
      await OrderOfTheDay.updateOne(
        { day: todayMidi.toDate() },
        { embed_message_id: embedMessage.id },
      );
    }
  }

  messageList?.forEach(message => {
    const embed = message.embeds[0];
    if (!embed) return false;
    const embedDate = dayjs(embed.timestamp);
    const diff = today.diff(embedDate, 'day');
    if (diff > 1) {
      message.delete();
    }
  });
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function generateEmbedOrderOfTheDay(
  missions?: ORDER_OF_THE_DAY['missions'],
) {
  const today = dayjs();
  const embed = new EmbedBuilder()
    .setTitle(
      `Ordre du jour ${capitalizeFirstLetter(
        today.format('dddd'),
      )} ${today.format('DD/MM')}`,
    )
    .addFields({ name: '🚎 Transfert(s) entreprise(s) 🚎', value: ' ' })
    .setColor('#00ff00');

  if (!missions) {
    embed.addFields({ name: '❌ Aucun', value: ' ' });
  } else {
    // reorder mission by hour asc carefully because hour is like HHhMM
    const reorderedMissions = missions.sort((a, b) => {
      const timeA = parseInt(a.hour.replace('h', ''), 10);
      const timeB = parseInt(b.hour.replace('h', ''), 10);

      if (timeA < 800 && timeB >= 800) return -1;
      if (timeB < 800 && timeA >= 800) return 1;

      return timeA - timeB;
    });

    reorderedMissions.forEach(mission => {
      let typeTranslated = '';
      let emoji = '';
      switch (mission.type) {
        case 'BILLETS':
          typeTranslated = 'Réhabilitation de billets';
          emoji = '💵';
          break;
        case 'SAISIE':
          typeTranslated = 'Transfert de saisie';
          emoji = '🔫';
          break;
        case 'SECURISE':
          typeTranslated = 'Transfert sécurisé';
          emoji = '🔒';
          break;
        case 'TRANSFERT':
          typeTranslated = 'Transfert entreprise';
          emoji = '🚎';
          break;
      }
      if (mission.type === 'SECURITY') {
        embed.addFields({
          name: `🕵️ ${mission.target} - ${mission.where} 🕵️‍♀️`,
          value: `🕔 ${mission.hour} - ${mission.nbrAgent} agent(s)`,
        });
      } else {
        embed.addFields({
          name: `🏢 ${mission.target} - ${typeTranslated} ${emoji}`,
          value: `🕔 ${mission.hour}`,
        });
      }
    });
  }

  embed
    .addFields({
      name: ' ',
      value:
        '●▬▬▬▬●<:stonk:1150105029353685205>●▬▬▬▬●●▬▬▬▬●<:stonk:1150105029353685205>●▬▬▬▬●',
    })
    .addFields({
      value:
        '🏧 Remplissage ATM entreprises en dessous de 10.000$ <:gtamoney:1150468326011711548>',
      name: ' ',
    });

  return embed;
}
