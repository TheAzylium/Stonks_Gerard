import {SlashCommand} from "../types";
import {EmbedBuilder, SlashCommandBuilder} from "discord.js";

export const command: SlashCommand = {
  name: 'ping',
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong! and the bot latency.'),

  execute: async (interaction) => {
  await interaction.reply({
    embeds: [
      new EmbedBuilder().setAuthor({name: 'Gerard'}).setDescription(`Pong!\n Ping: ${interaction.client.ws.ping}ms`).setColor('#ff8e4d')
  ]
  });
  }
}
