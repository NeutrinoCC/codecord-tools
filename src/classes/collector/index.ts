import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  InteractionCollector,
  Message,
  MessageCollector,
  MessageComponentInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
} from "discord.js";
import { InteractionListenersObject, InteractionListener } from "./types";
import { Timeout } from "../timeout";
import { log } from "../../log";

const cooldown = new Timeout({ maxStrikes: 20 });

export class Collector {
  interaction: ChatInputCommandInteraction | MessageComponentInteraction;
  collectors: Set<InteractionCollector<any> | MessageCollector> = new Set();

  constructor(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
  ) {
    this.interaction = interaction;
  }

  /**
   *
   * @example
   * await collector.listen({
   *  'red-button': (i) => i.reply('You pressed the red button! 🔴'),
   *  'green-button': (i) => i.reply('You pressed the green button! 🟢')
   * }, 10 * 60 * 1000); // time when the collector is going to be active (empty for infinite)
   *
   *
   * @void
   */
  async listen(
    listeners: InteractionListenersObject,
    timeoutMiliseconds?: number
  ) {
    const { channel, locale: lang } = this.interaction;

    // if the channel is not valid
    if (!channel || !channel.isTextBased() || channel.isDMBased())
      throw log.error("collector.error.invalidChannel", { lang });

    // if the interaction is not replied yet
    if (!this.interaction.replied)
      throw log.error("collector.error.interactionNoReplied", {
        lang,
      });

    const reply = await this.interaction.fetchReply().catch((error) => {
      throw log.error("collector.error.fetchReplyError", {
        lang,
        replacements: { error: String(error) },
      });
    });

    const filter = (i: MessageComponentInteraction) =>
      reply.id === i.message.id && this.interaction.user.id === i.user.id;

    // create collector
    const collector = channel.createMessageComponentCollector({
      time: timeoutMiliseconds || 15 * 60 * 60 * 1000,
      filter,
    });

    this.collectors.add(collector);

    // assign collector listeners
    collector.on("collect", async (i: MessageComponentInteraction) => {
      const listener: InteractionListener | undefined = listeners[i.customId];

      if (!listener) return;

      await listener(i);

      if (listeners.default) await listeners.default(i);
    });

    // remove components from message
    collector.once("end", async () => {
      if (this.interaction.replied)
        await this.interaction.editReply({ components: [] }).catch((e) => null);
    });
  }

  stop() {
    for (const collector of Array.from(this.collectors.values())) {
      collector.stop();
      this.collectors.delete(collector);
    }
  }

  /**
   *
   * @param listener
   * @param timeoutMiliseconds
   * @example
   *  collector.awaitMessage((message) => {
   *    if(!message.content.startsWith('+')) return;
   *
   *    await message.reply("Message recieved!")
   * }, 10 * 60 * 1000); // ten minutes to send the message
   */
  async awaitMessage(
    listener: (message: Message) => Promise<any>,
    timeoutMiliseconds?: number
  ) {
    const { channel, locale: lang } = this.interaction;

    // if the channel is not valid
    if (!channel || !channel.isTextBased() || channel.isDMBased())
      throw log.error("collector.error.invalidChannel", { lang });

    // if the channel is not valid
    if (!channel || !channel.isTextBased() || channel.isDMBased())
      throw log.error("collector.error.invalidChannel", { lang });

    // if the interaction is not replied yet
    if (!this.interaction.replied)
      throw log.error("collector.error.interactionNoReplied", {
        lang,
      });

    const filter = (i: Message) => this.interaction.user.id === i.author.id;

    // create a message collector
    const collector = channel.createMessageCollector({
      time: timeoutMiliseconds || 15 * 60 * 60 * 1000,
      filter,
      maxProcessed: 1,
    });

    this.collectors.add(collector);

    collector.on("collect", listener);

    collector.once("end", async () => {
      collector.stop();
    });

    return collector;
  }

  /**
   *  Creates a new modal submission
   * @example
   * await collector.submission({
   *  title: 'Favourite fruit',
   *  timeMiliseconds: 10 * 60 * 1000, // ten minutes to reply the modal
   *  cooldown: true, // prevents the user to spam interactions
   *  interaction: someInteraction, // discord.js cmd or component interaction
   *  inputs: [{
   *    new TextInputBuilder() // discord.js text input builder class
   *    .setCustomId('fruit')
   *    .setLabel('Favourite fruit')
   *    .setStyle(TextInputStyle.Short)
   *  }],
   * });
   * @returns
   */
  async submission(options: {
    inputs: TextInputBuilder[];
    timeMiliseconds?: number;
    title?: string;
    cooldown?: boolean;
    interaction?: MessageComponentInteraction | ChatInputCommandInteraction;
    logs?: boolean;
  }) {
    const interaction = options.interaction || this.interaction;

    const { locale: lang, user } = interaction;

    if (interaction.replied)
      throw log.error("collector.error.alreadyReplied", { lang });

    if (options.cooldown && cooldown.is(user.id)) {
      log("collector.warn.userTimeout", {
        lang,
        replacements: { user: user.username },
      });
      return;
    }

    const { timeMiliseconds, title, inputs, logs } = options;

    const custom_id = `submission:${interaction.id}`;

    const modal = new ModalBuilder({
      title: title || "Rellena el formulario",
      custom_id,
    });

    if (inputs.length < 1)
      throw log.error("collector.error.minimumInputs", { lang });

    // push a new row builder to the modal component for each input
    for (const input of inputs)
      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(input)
      );

    const filter = interaction.isMessageComponent()
      ? // if the interaction is a button, then the message can be used as filter
        (submission: ModalSubmitInteraction) =>
          submission.message?.id === interaction.message.id &&
          submission.user.id === interaction.user.id &&
          submission.customId === custom_id
      : // if the interaction is a slash command
        (submission: ModalSubmitInteraction) =>
          submission.user.id === interaction.user.id &&
          submission.customId === custom_id;

    if (options.cooldown) cooldown.set(user.id, 2 * 60 * 1000);

    await interaction.showModal(modal);

    // awaits the modal to be submitted.
    const submission = await interaction
      .awaitModalSubmit({
        time: timeMiliseconds || 5 * 60 * 1000,
        filter,
      })
      .catch(() => {
        return null;
      });

    if (!submission) return undefined; // if the modal is not replied

    if (logs === undefined || logs === true)
      log("collector.log.submitted", {
        lang,
        replacements: { username: user.username, modal: title || "a modal" },
      });

    const values = new Map<string, string>();

    submission.fields.components.forEach((row) => {
      const data = row.components[0];

      if (!data) return;

      values.set(data.customId, data.value);
    });

    return { response: submission, values };
  }
}
