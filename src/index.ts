import * as dotenv from 'dotenv';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Buttons, Modals, SelectMenu, SlashCommand } from './types';

const envFile = process.argv[2] === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

client.slashCommands = new Collection<string, SlashCommand>();
client.buttons = new Collection<string, Buttons>();
client.modals = new Collection<string, Modals>();
client.selectMenus = new Collection<string, SelectMenu>();

const handlersDirs = join(__dirname, './handlers');

readdirSync(handlersDirs).forEach(file => {
  require(`${handlersDirs}/${file}`)(client);
});

client.login(process.env.TOKEN);
