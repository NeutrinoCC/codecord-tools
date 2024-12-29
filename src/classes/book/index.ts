import { log } from "../../log";
import { Collector } from "../collector";
import { BookElements, BookInteraction, BookOptions, Render } from "./types";

export class Book {
  render: Render;
  elements: BookElements = [];
  elementsPerPage: number;
  interaction;
  collector: Collector;

  page: number;
  paragraph: number;

  constructor({ render, elements, elementsPerPage, interaction }: BookOptions) {
    this.render = render;
    this.elementsPerPage = elementsPerPage || 1;
    this.interaction = interaction;
    this.collector = new Collector(interaction);

    if (elements) this.elements = elements;

    this.page = 1;
    this.paragraph = 1;
  }

  /**
   * Renders the book and writes (replies the interaction or updates the reply)
   * @example
   * await book.write()
   */
  async write() {
    const pageElements = await this.getPageElements();

    const render: any = await this.render(pageElements);

    try {
      if (this.interaction.replied || this.interaction.deferred)
        await this.interaction.editReply(render);
      else await this.interaction.reply(render);
    } catch (error) {
      this.collector.stop();

      log("book.warn.writeError", {
        lang: this.interaction.locale,
        replacements: {
          error: String(error),
        },
      });
    }
  }

  /**
   * Pass the page
   */
  async next() {
    this.page += 1;

    const pages = await this.getPages();

    if (this.page > pages) this.page = 1;

    await this.write();
  }

  /**
   * Go to previous page
   */
  async previous() {
    this.page -= 1;

    const pages = await this.getPages();

    if (this.page <= 0) this.page = pages;

    await this.write();
  }

  async goToParagraph(index: number) {
    const pageElements = await this.getPageElements();

    if (index > pageElements.length) index = 1;
    else if (index <= 0) index = pageElements.length;

    this.paragraph = index;

    await this.write();
  }

  // returns the total elements in this book
  private getElements = async () =>
    typeof this.elements === "object" ? this.elements : await this.elements();

  // returns the number of pages of this book
  private getPages = async (elements?: any[]) => {
    let pages =
      (elements || (await this.getElements())).length / this.elementsPerPage;

    if (pages % 1 !== 0) pages += 1;

    return Number(pages.toFixed(0));
  };

  // gets the elements of a page
  private getPageElements = async (page?: number, elements?: any[]) => {
    if (!page) page = this.page; // use the current page if not declared

    const _elements = elements || (await this.getElements());

    return _elements.slice(
      (page - 1) * this.elementsPerPage,
      (page - 1) * this.elementsPerPage + this.elementsPerPage
    );
  };
}
