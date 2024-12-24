import {
  ChannelManager,
  ChannelType,
  Client,
  GuildChannel,
  Message,
} from "discord.js";
import { JsonManager } from "../jsonManager";
import { JsonFilePanelData } from "./types";
import ApiError from "../../errors";

export class Panel {
  static manager: JsonManager | null = null;
  name;

  constructor(name: string) {
    this.name = name;

    if (!Panel.manager)
      throw new Error(
        "Not possible to create a panel instance without define the panels route with Panel.setPanelJsonFilePath(_path)."
      );
  }

  static setPanelJsonFilePath(_path: string) {
    Panel.manager = new JsonManager(_path);
  }

  async fetch(channels: ChannelManager) {
    if (!Panel.manager || !Panel.manager.has(this.name)) return;

    const { messageId, channelId }: JsonFilePanelData = await Panel.manager.get(
      this.name
    );

    const channel = await channels.fetch(channelId).catch(() => null);

    if (!channel || channel.type !== ChannelType.GuildText) {
      await Panel.manager.delete(this.name);
      return;
    }

    let message = await channel.messages.fetch(messageId).catch(() => null);

    if (!message) {
      message = await channel.send({
        content: `**${this.name}**`,
      });

      await Panel.manager.set(`${this.name}.messageId`, message.id);
    }

    return message;
  }

  async build(message: Message) {
    const { channel } = message;

    if (!Panel.manager || channel.type !== ChannelType.GuildText)
      ApiError.throw("noTextChannel");

    await Panel.manager.set(this.name, {
      messageId: message.id,
      channelId: message.channel.id,
    });

    return message;
  }
}
