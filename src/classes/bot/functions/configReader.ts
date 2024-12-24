import { join } from "path";
import fs from "fs";
import { log } from "../../../log";
import { JsonManager } from "../../jsonManager";
import { BotConfig, BotOptions, BotOptionsData } from "../types/bot";
import { load } from "./readFile";
import { Client } from "discord.js";
import { defaultBotInvocation } from "../config/bot";

export default async (path: string) => {
  const _path = join(process.cwd(), path);

  if (!fs.existsSync(_path))
    throw log.error("error.configFileDoesNotExist", { replacements: { path } });

  return new JsonManager(_path);
};

/**
 * Transforms bot invoke configuration to a bot constructor object.
 * @param {BotInvokeConfiguration} config Bot invoke config
 * @returns BotConstructor
 */
export const readInvokeOptions = (config: BotOptions | string) =>
  typeof config === "string" ? readBotInvokeOptionsFromPath(config) : config;

/**
 * Gets the configuration from a file, and returns a bot invoke configuration
 * @param configPath
 * @returns Bot Invoke Config
 */
function readBotInvokeOptionsFromPath(configPath: string) {
  // get absolute path of the config file
  const abConfigPath = join(process.cwd(), configPath);

  // if the file doesn't exist
  if (!fs.existsSync(abConfigPath))
    throw log.error("error.configFileDoesNotExist", {
      replacements: { configPath },
    });

  try {
    // try to get this json data
    const data: BotOptions = require(abConfigPath);

    // return the data as a bot invoker
    return data;
  } catch (error) {
    // if an error ocurrs trying to read json file.
    throw log.error("error.errorOnConfigFileRead", {
      replacements: { error: String(error) },
    });
  }
}

// get option data
export const getBotOptionsData = (options: BotOptions): BotOptionsData =>
  Object.assign(defaultBotInvocation, options);

/**
 * Transforms bot invocation data to bot configuration
 * @param invokeData
 */
export function botConstructorFromInvocation(data: BotOptionsData): BotConfig {
  let logs = data.logs || false;

  if (logs)
    log("bot.start.config", {
      replacements: {
        config: Object.entries(data)
          .map(
            (opt) =>
              `\t> ${opt[0]}: ${
                opt[0] == "token"
                  ? "***"
                  : String(
                      typeof opt[1] === "object"
                        ? JSON.stringify(opt[1])
                        : opt[1]
                    )
              }`
          )
          .join("\n"),
      },
    });

  const { files, client: clientOptions, guildId } = data;

  if (logs) log("bot.start.client");

  const client = new Client(clientOptions);

  if (logs) log("bot.start.files");

  // load commands, interactions, events
  const { commands, events, interactions } = load.files(files, logs);

  return {
    commands,
    events,
    interactions,
    client,
    guildId,
    logs,
  };
}
