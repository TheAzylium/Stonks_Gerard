import { BotEvent } from '../types';
import { Client, Events } from 'discord.js';
import { formatRoleName, rolesMap } from '../const/rolesManager';
import { generatePosteList } from '../const/RolesList';
import { generatePoleList } from '../const/PolesList';

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return console.log('❌ Guild not found');

    guild.roles.cache.forEach(role => {
      rolesMap.set(formatRoleName(role.name), role.id);
    });

    generatePosteList();
    generatePoleList();
  },
};

export default event;
