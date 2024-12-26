import { Collector } from "./classes/collector";
import { Book } from "./classes/book";
import { JsonManager } from "./classes/jsonManager";
import { Portrait } from "./classes/portrait";
import { CoordinateReference } from "./classes/portrait/types";
import { Panel } from "./classes/panel";
import { DateParser } from "./classes/date";
import { Ini } from "./classes/ini";
import { Branding } from "./classes/branding";
import { Timeout } from "./classes/timeout";
import { Bot, Command, Interaction, Event } from "./classes/bot";

export default {
  Timeout,
  Ini,
  Bot,
  Event,
  Command,
  Interaction,
  Collector,
  Book,
  JsonManager,
  Portrait,
  Panel,
  DateParser,
  CoordinateReference,
  Branding,
};

export {
  Bot,
  Event,
  Command,
  Interaction,
  Ini,
  Timeout,
  Branding,
  Collector,
  Book,
  JsonManager,
  Portrait,
  Panel,
  DateParser,
  CoordinateReference,
};
