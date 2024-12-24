import { log } from "../../../log";
import { Bot } from "../classes/bot";

/**
 * Starts event listeners
 */
export function startBotListeners(bot: Bot, logs?: true | false) {
  if (logs) log("bot.start.eventListeners");

  for (const [eventName, eventFunctions] of bot.events.entries()) {
    if (logs)
      log("bot.event.listen", {
        replacements: {
          eventName,
          eventLength: String(eventFunctions.length),
        },
      });

    for (const eventFunction of eventFunctions)
      bot.client.on(eventName, eventFunction);
  }
}
