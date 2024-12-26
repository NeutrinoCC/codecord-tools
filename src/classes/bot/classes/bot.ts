import { BotOptions } from "../types/bot";
import {
  botConstructorFromInvocation,
  getBotOptionsData,
  readInvokeOptions,
} from "../functions/configReader";
import { log } from "../../../log";
import { registerCommands } from "../functions/registerCommands";
import { startBotListeners } from "../functions/runBotListeners";
import { interactionHandler } from "../functions/interactionHandler";

export class Bot {
  client;
  commands;
  interactions;
  events;
  guildId;
  private logs = true;

  /**
   * Creates a new bot
   * @param options
   * @example
   * const bot = new Bot({
      token:
        "YOUR_DISCORD_TOKEN",
      files: {
        commands: ["commandPath/*"],
        interactions: ["interactionsPath/*.js"],
        events: ["events/client/*.js"],
      },
    });
   */
  constructor(options: BotOptions | string) {
    // if the supplied parameter was a path, then get the contents of the file.
    options = readInvokeOptions(options);

    if (options.logs !== false) log("bot.start.first");

    // get options data
    const data = getBotOptionsData(options);

    // create bot constructor
    const { client, commands, interactions, events, guildId, logs } =
      botConstructorFromInvocation(data);

    this.client = client;
    this.commands = commands;
    this.interactions = interactions;
    this.events = events;
    this.guildId = guildId;
    this.logs = logs;

    // push snap interaction handler
    if (data.autoInteractionHandler) {
      if (logs) log("bot.start.interactionHandler");

      const interactionCreateListeners =
        this.events.get("interactionCreate") || [];

      interactionCreateListeners.push(interactionHandler(this, this.logs));

      this.events.set("interactionCreate", interactionCreateListeners);
    }

    // register commands
    if (data.registerCommands)
      registerCommands({
        token: options.token,
        logs,
        guildId,
        commands,
      });

    // start listening
    startBotListeners(this, logs);

    if (logs) log("bot.start.end");

    this.connect(options.token);
  }

  /**
   * Connect client to a discord application
   * @param token Bot token
   */
  async connect(token: string) {
    try {
      if (this.logs) log("bot.start.logging");

      // login into discord
      await this.client.login(token);

      if (this.logs) {
        console.clear();

        log("bot.start.connected", {
          replacements: {
            username: String(this.client.user?.username || "Unknown"),
          },
        });
      }
    } catch (error) {
      throw log.error("bot.error.clientConnectionFailed", {
        replacements: {
          error: String(error),
        },
      });
    }
  }

  /**
   * Disconnect client from application
   */
  async disconnect() {
    try {
      if (this.logs) log("bot.disconnect");

      await this.client.destroy();

      if (this.logs) log("bot.disconnected");
    } catch (error) {
      throw log.error("error.clientDisconnectionFailed");
    }
  }

  /**
   * Restarts the client
   * @param token Bot token
   */
  async restart(token: string) {
    if (!this.client.isReady) return;

    this.disconnect();

    this.connect(token);
  }
}
