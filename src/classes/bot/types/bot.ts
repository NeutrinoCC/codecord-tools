import { Client, ClientOptions, Collection } from "discord.js";
import { Command } from "../classes/command";
import { EventFunction, InteractionFunction } from "../types";

export interface BotConfig {
  commands: Collection<string, Command>;
  interactions: Collection<string, InteractionFunction>;
  events: Collection<string, EventFunction[]>;
  client: Client;
  guildId: string | null;
  logs: true | false;
}

/**
 * @prop {string} token Discord Application Token
 * @prop { string | null } guildId Unique Guild Bot / Multi Guild
 * @prop {string} mongoDbConnectionUri Mongo DB connection
 * @prop {string[]} handlerPaths Commands, Interactions, Events
 * @prop {Client} client Client Option
 * @prop { true | false } registerCommands
 * @prop {true | false | string } logs
 */
export interface BotOptions {
  token: string;
  guildId: string | null;
  mongoDbConnectionUri?: string;
  files?: {
    commands?: string[];
    interactions?: string[];
    events?: string[];
  };
  client?: ClientOptions;
  registerCommands?: true | false;
  logs?: true | false;
  autoInteractionHandler?: true | false;
}

/**
 * The invoke options are transformed so they can be transformed to a bot config interface
 */
export interface BotOptionsData extends BotOptions {
  files: BotFiles;
  client: ClientOptions;
  registerCommands: true | false;
  logs: true | false;
  autoInteractionHandler: true | false;
  guildId: string | null;
}

export type BotFiles = {
  commands: string[];
  events: string[];
  interactions: string[];
};
