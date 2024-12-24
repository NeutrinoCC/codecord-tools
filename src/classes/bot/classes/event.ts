import { CommandFunction, EventFunction, InteractionFunction } from "../types";
import { containsUppercaseSymbolsOrSpaces } from "../functions/validator";
import { Events, Collection } from "discord.js";

/**
 * @example
 * const { Event } = require("codecord");
 *
 * new Event("ready", (client) => {
 *  console.log("Hello world!")
 * });
 */
export class Event {
  name: Events | string;
  execute: EventFunction;

  constructor(event: Events | string, execute: EventFunction) {
    this.name = event;
    this.execute = execute;
  }
}
