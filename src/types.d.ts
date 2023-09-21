import {
  Collection,
  CommandInteraction,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  StringSelectMenuBuilder,
} from 'discord.js';

export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args) => Promise<void>;
}

export interface SlashCommand {
  name: string;
  data: SlashCommandBuilder | any;
  execute: (interaction: CommandInteraction) => any;
}

export interface Buttons {
  data: ButtonBuilder | any;
  execute: (interaction: ButtonInteraction) => any;
}

export interface Modals {
  data: ModalBuilder | any;
  execute: (interaction: ModalSubmitInteraction) => any;
}
export interface SelectMenu {
  data: StringSelectMenuBuilder | any;
  execute: (interaction: StringSelectMenuInteraction) => any;
}
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_ID: string;
      TOKEN: string;
      MONGODB_URI: string;
    }
  }
}

declare module 'discord.js' {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    buttons: Collection<string, Buttons>;
    modals: Collection<string, Modals>;
    selectMenus: Collection<string, SelectMenu>;
  }
}
