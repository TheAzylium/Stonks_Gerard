import { Collection, CommandInteraction, Message, PermissionResolvable, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js"

export interface BotEvent {
    name: string,
    once?: boolean | false,
    execute: (...args?) => Promise<void>
}

export interface SlashCommand {
    name: string,
    data: SlashCommandBuilder | any,
    execute: (interaction : CommandInteraction) => any,
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CLIENT_ID: string
            TOKEN: string
            AGENT_ROLE_ID: string
            MAN_ID: string
            WOMAN_ID: string
            RH_ROLE_ID: string
            ADMIN_ROLE_ID: string
            HS_ROLE_ID: string
            COMMERCIAL_ROLE_ID: string
            FORMATEUR_ROLE_ID: string
            CHEF_ROLE_ID: string
            CONFIRMED_ROLE_ID: string
            SENIOR_ROLE_ID: string
            JUNIOR_ROLE_ID: string
            STAGIAIRE_ROLE_ID: string
            RH_CATEGORY_ID: string
            MONGODB_URI: string
        }
    }
}

declare module "discord.js" {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>
    }
}
