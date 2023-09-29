import { BotEvent } from '../types';
import { Client, Events } from 'discord.js';
import { channelMap, formatChannelName } from '../const/channelManager';

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return console.log('❌ Guild not found');

    guild.channels.cache.forEach(channel => {
      channelMap.set(formatChannelName(channel.name), channel.id);
    });
  },
};

export default event;
