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
      AGENT_ROLE_ID: string;
      MAN_ID: string;
      WOMAN_ID: string;
      RH_ROLE_ID: string;
      ADMIN_ROLE_ID: string;
      HS_ROLE_ID: string;
      COMMERCIAL_ROLE_ID: string;
      FORMATEUR_ROLE_ID: string;
      CHEF_ROLE_ID: string;
      CONFIRMED_ROLE_ID: string;
      SENIOR_ROLE_ID: string;
      JUNIOR_ROLE_ID: string;
      STAGIAIRE_ROLE_ID: string;
      RH_CATEGORY_ID: string;
      MONGODB_URI: string;
      ORDER_OF_THE_DAY_PRIVATE_CHANNEL_ID: string;
      ORDER_OF_THE_DAY_PUBLIC_CHANNEL_ID: string;
      FORMATION_CHANNEL_ID: string;
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
