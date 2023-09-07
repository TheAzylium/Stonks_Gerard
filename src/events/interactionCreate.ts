import {BotEvent} from "../types";
import {Client, Events, Interaction} from "discord.js";

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute( interaction: Interaction){
        if (!interaction.isChatInputCommand()) return;
        const commands = interaction.client.slashCommands.get(interaction.commandName);

        if (!commands) return;

        await commands.execute(interaction);


    }
}

export default event;
