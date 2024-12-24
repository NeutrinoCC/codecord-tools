import { CommandFunction, EventFunction, InteractionFunction } from "../types";
import { containsUppercaseSymbolsOrSpaces } from "../functions/validator";

/**
 * @example
 * new Interaction()
 *  .setName("example")
 *  .setExecution((interaction) => {
 *    await interaction.reply("Thank you for pressing the button!")
 *  });
 */
export class Interaction {
  name: string;
  execute: InteractionFunction;

  constructor(name: string, execute: InteractionFunction) {
    if (containsUppercaseSymbolsOrSpaces(name))
      throw new Error("Expected a string primitive.");

    this.name = name;
    this.execute = execute;
  }
}
