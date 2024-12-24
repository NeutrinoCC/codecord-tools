import { defaultClientConfig } from "./client";

const defaultBotInvocation = {
  token: null,
  guildId: null,
  mongoDbConnectionUri: null,
  files: {
    commands: [],
    interactions: [],
    events: [],
  },
  registerCommands: true,
  logs: true,
  client: defaultClientConfig,
  autoInteractionHandler: true,
};

export { defaultBotInvocation };
