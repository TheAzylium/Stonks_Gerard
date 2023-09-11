import { Client, REST, Routes } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import { SlashCommand } from '../types';

module.exports = async (client: Client) => {
  const body = [];
  const commandsDirs = join(__dirname, '../slashCommands');

  readdirSync(commandsDirs).forEach((dir) => {
    readdirSync(`${commandsDirs}/${dir}`).forEach((file) => {
      if (!file.endsWith('.js')) return;

      const command: SlashCommand = require(`${commandsDirs}/${dir}/${file}`).command;
      body.push(command.data.toJSON());
      console.log(`Command ${command.name} loaded!`);
      client.slashCommands.set(command.name, command);
    });
  })

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body });
  } catch (e) {
    console.error(e);
  }
};
