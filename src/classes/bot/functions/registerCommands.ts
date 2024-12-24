import { Collection, REST, Routes } from "discord.js";
import { log } from "../../../log";
import { Command } from "../classes/command";

/**
 * REST request to register this bot commands.
 */
export async function registerCommands({
  token,
  guildId,
  logs,
  commands,
}: {
  token: string;
  guildId: string | null;
  logs?: true | false;
  commands: Collection<string, Command>;
}) {
  let now = Date.now();

  log("bot.start.commandRegister");

  // get client token
  if (!token) throw log.error("error.noToken");

  // get client id from token
  const base64Id = token.split(".")[0];

  if (!base64Id) throw log.error("error.base64Id");

  const clientId = Buffer.from(base64Id, "base64").toString("ascii");

  try {
    const Rest: REST = new REST().setToken(token);

    // Rest routes
    const routes = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);

    // Rest request
    await Rest.put(routes, {
      body: commands.map((cmd) => cmd.data.toJSON()),
    });

    log("bot.start.commandRegisterReport", {
      replacements: {
        amount: String(commands.size),
        delay: String(Date.now() - now),
      },
    });
  } catch (error) {
    // handle any exception (simply logs the error)
    log("warn.commandRegisterError", {
      replacements: { error: String(error) },
    });
  }
}
