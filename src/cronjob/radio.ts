import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { channelMap } from '../const/channelManager';
import dayjs from 'dayjs';
import { capitalizeFirstLetter } from './order_of_the_days';
import FrequenceOfTheDaySchema from '../models/FrequenceOfTheDay';
import RadioSecuSchema, { RADIOSECU } from '../models/RadioSecuModel';

export async function generate_frequence_cron(client: Client) {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  if (!guild) return console.log('❌ Guild not found');
  const today = dayjs();
  const frequenceOfTheDay = await FrequenceOfTheDaySchema.findOne({
    createdAt: {
      $lte: today.hour(23).minute(59).second(59).millisecond(999).toDate(),
      $gte: today.hour(0).minute(0).second(0).millisecond(0).toDate(),
    },
  });

  if (frequenceOfTheDay) return;

  const currentSecurity: RADIOSECU = await RadioSecuSchema.findOne()
    .sort({ _id: -1 })
    .lean();

  const newRadio = {
    security: currentSecurity?.frequence || 'Frequence non définie',
    interne: create_frequence(),
    transfert: create_frequence(),
  };

  const title = `Frequence radio du ${capitalizeFirstLetter(
    today.format('dddd'),
  )} ${today.format('DD/MM')}`;

  const message: string = await send_frequence(client, newRadio, title);

  await FrequenceOfTheDaySchema.create({
    transfert: newRadio.transfert,
    interne: newRadio.interne,
    security: newRadio.security,
    embedId: message,
  });

  let channel = guild.channels.cache.get(
    channelMap.get('frequence-radio'),
  ) as TextChannel;

  if (!channel) {
    const channelList = await guild.channels.fetch();
    channel = channelList.find(
      channel => channel.id === channelMap.get('frequence-radio'),
    ) as TextChannel;
  }

  const messageList = await channel?.messages.fetch({ limit: 100 });

  messageList?.forEach(message => {
    const embed = message.embeds[0];
    if (!embed) return false;
    const embedDate = dayjs(embed.timestamp);
    const diff = today.diff(embedDate, 'day');
    if (diff > 5) {
      message.delete();
    }
  });
}

export async function send_frequence(
  client: Client,
  frequence: { interne: string; transfert: string; security: string },
  title: string,
) {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  if (!guild) {
    console.log('❌ Guild not found');
    return 'Guild not found';
  }

  let channel = guild.channels.cache.get(
    channelMap.get('frequence-radio'),
  ) as TextChannel;

  if (!channel) {
    const channelList = await guild.channels.fetch();
    channel = channelList.find(
      channel => channel.id === channelMap.get('frequence-radio'),
    ) as TextChannel;
  }

  const embed = new EmbedBuilder()
    .setTitle(`${title}`)
    .setColor('#0099ff')
    .addFields({
      name: '<:stonk:1150105029353685205> Interne',
      value: frequence.interne,
    })
    .addFields({ name: '🚎 Transfert', value: frequence.transfert })
    .addFields({ name: '👮 Sécurité', value: frequence.security });

  if (channel) {
    return (await channel.send({ embeds: [embed] })).id;
  }
  return 'Channel not found';
}

export function create_frequence() {
  const partieEntiere = Math.floor(Math.random() * 900 + 100); // génère un nombre entre 100 et 999
  const partieDecimale = Math.floor(Math.random() * 100); // génère un nombre entre 0 et 99
  const frequence = `${partieEntiere}.${
    partieDecimale < 10 ? '0' : ''
  }${partieDecimale}`;

  const pattern = /^[1-9][0-9]{2}\.[0-9]{2}$/;
  if (!pattern.test(frequence)) {
    return create_frequence();
  }
  return frequence;
}
