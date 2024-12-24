import { Interaction as DjsInteraction } from "discord.js";
import { Bot } from "../classes/bot";
import { log } from "../../../log";
import { Command } from "../classes/command";
import { EventFunction } from "../types";

export function interactionHandler(
  bot: Bot,
  logs: true | false
): EventFunction {
  return async (interaction: DjsInteraction) => {
    if (interaction.isChatInputCommand()) {
      // Command interaction
      const command = bot.commands.get(interaction.commandName) as
        | Command
        | undefined;

      // command use log message
      if (logs)
        log("bot.interaction.command", {
          replacements: {
            command: String(command?.data.name || "unknown"),
            username: interaction.user.username,
            userId: interaction.user.id,
          },
          lang: interaction.locale,
        });

      if (!command)
        return log("warn.noCommandFound", {
          replacements: { command: String(interaction.commandName) },
          lang: interaction.locale,
        });

      if (!command.execute)
        return log("warn.noCommandExecutionAssigned", {
          replacements: { command: String(command.data.name) },
          lang: interaction.locale,
        });

      try {
        await command.execute(interaction);
      } catch (error) {
        // handle any exception (simply logs the error)
        log("warn.commandExecution", {
          replacements: { command: command.data.name, error: String(error) },
          lang: interaction.locale,
        });
      }
    } else if (interaction.isMessageComponent()) {
      const execute = bot.interactions.get(interaction.customId);

      // command use log message
      if (logs)
        log("bot.interaction.component", {
          replacements: {
            customId: String(interaction.customId),
            type: interaction.isButton()
              ? "{b}"
              : interaction.isAnySelectMenu()
              ? "{m}"
              : "i",
            username: interaction.user.username,
          },
          lang: interaction.locale,
        });

      if (!execute)
        return log("warn.noInteractionExecutionFound", {
          replacements: { interaction: String(interaction.customId) },
          lang: interaction.locale,
        });

      try {
        execute(interaction);
      } catch (error) {
        // handle exception only making log of the error
        log("warn.interactionExecution", {
          replacements: {
            interaction: interaction.customId,
            error: String(error),
          },
          lang: interaction.locale,
        });
      }
    }
  };
}
