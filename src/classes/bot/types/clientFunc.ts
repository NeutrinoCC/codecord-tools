import {
  ChatInputCommandInteraction,
  MessageComponentInteraction,
} from "discord.js";

export type CommandFunction = (
  cmd: ChatInputCommandInteraction
) => any | Promise<any>;

export type InteractionFunction = (
  cmd: MessageComponentInteraction
) => any | Promise<any>;

export type EventFunction = (context: any) => any | Promise<any>;
