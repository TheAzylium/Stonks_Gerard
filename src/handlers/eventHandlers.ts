import { Client } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import { BotEvent } from '../types';

module.exports = (client: Client) => {
  const eventsDirs = join(__dirname, '../events');

  readdirSync(eventsDirs).forEach(file => {
    if (!file.endsWith('.js')) return;
    const event: BotEvent = require(`${eventsDirs}/${file}`).default;

    event.once
      ? client.once(event.name, (...args) => event.execute(...args))
      : client.on(event.name, (...args) => event.execute(...args));

    console.log(`Event ${event.name} loaded!`);
  });
};
