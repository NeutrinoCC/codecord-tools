import { glob, globSync } from "glob";
import fs from "fs";
import { Command } from "../classes/command";
import { Event } from "../classes/event";
import { Interaction } from "../classes/interaction";
import { Collection, Events } from "discord.js";
import { InteractionFunction } from "../types";
import { BotFiles } from "../types/bot";
import { EventFunction } from "../types";
import { log } from "../../../log";
import { join, normalize, isAbsolute, extname } from "path";

export function readPathContents(path: string, logs?: true | false) {
  const set = new Set();

  try {
    if (logs)
      log("bot.start.readPath", {
        replacements: { path },
      });

    const files = globSync(path);

    for (const file of files) {
      if (logs)
        log("bot.start.foundFile", {
          replacements: {
            file,
          },
        });

      try {
        let abPath = join(process.cwd(), file);

        let content: any = require(abPath);

        if (content.default) content = content.default;

        if (logs) {
          log("bot.start.fileInstance", {
            replacements: {
              instance: String(
                content instanceof Command
                  ? "Command"
                  : content instanceof Interaction
                  ? "Interaction"
                  : content instanceof Event
                  ? "Event"
                  : `Unknown (${extname(file)})`
              ),
            },
          });

          log("bot.start.fileAbsolutePath", {
            replacements: {
              path: abPath,
            },
          });
        }

        set.add(content);
      } catch (error) {
        log("warn.requireFileError", {
          replacements: {
            file,
            error: String(error),
          },
        });
      }
    }

    return set;
  } catch (error) {
    return set;
  }
}

export const load = {
  files: (files: BotFiles, logs?: true | false) => ({
    commands: load.commands(files.commands || [], logs),
    interactions: load.interactions(files.interactions || [], logs),
    events: load.events(files.events || [], logs),
  }),
  commands: (paths: string[], logs?: true | false) => {
    const collection: Collection<string, Command> = new Collection();

    for (const path of paths) {
      Array.from(readPathContents(path, logs).values())
        .filter((c) => c instanceof Command)
        .forEach((command: Command) =>
          collection.set(command.data.name, command)
        );
    }

    if (logs && collection.size > 0)
      log("bot.start.commandsReport", {
        replacements: {
          total: String(collection.size),
          list: Array.from(collection.values())
            .map((cmd, i) => `\t${i + 1}. ${cmd.data.name}`)
            .join("\n"),
        },
      });

    return collection;
  },
  events: (paths: string[], logs?: true | false) => {
    const collection: Collection<string, EventFunction[]> = new Collection();

    for (const path of paths) {
      Array.from(readPathContents(path, logs).values())
        .filter((c) => c instanceof Event)
        .forEach((event: Event) => {
          const listeners = collection.get(event.name) || [];

          listeners.push(event.execute);

          collection.set(event.name, listeners);
        });
    }

    if (logs && collection.size > 0)
      log("bot.start.eventsReport", {
        replacements: {
          total: String(collection.size),
          list: Array.from(collection.entries())
            .map(
              ([name, functions], i) =>
                `\t${i + 1}. ${name} (${functions.length})`
            )
            .join("\n"),
        },
      });

    return collection;
  },
  interactions: (paths: string[], logs?: true | false) => {
    const collection: Collection<string, InteractionFunction> =
      new Collection();

    for (const path of paths) {
      Array.from(readPathContents(path, logs).values())
        .filter((c) => c instanceof Interaction)
        .forEach((interaction: Interaction) =>
          collection.set(interaction.name, interaction.execute)
        );
    }

    if (logs && collection.size > 0)
      log("bot.start.interactionsReport", {
        replacements: {
          total: String(collection.size),
          list: Array.from(collection.keys())
            .map((interaction, i) => `\t${i + 1}. ${interaction}`)
            .join("\n"),
        },
      });

    return collection;
  },
};
