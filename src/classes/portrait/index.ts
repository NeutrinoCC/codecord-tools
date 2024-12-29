import { AttachmentBuilder } from "discord.js";
import { ImageOptions, TextOptions, LineOptions, FillOptions } from "./types";
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";

export class Portrait {
  canvas;
  ctx;

  /**
   * Create a new portrait instance
   * @param width Width of the canvas
   * @param height Height of the canvas
   */
  constructor(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    this.canvas = canvas;
    this.ctx = ctx;
  }

  async toBuffer() {
    return this.canvas.toBuffer("image/png");
  }

  /**
   * Returns an AttachmentBuilder of the image
   * @param name
   * @returns
   */
  async createAttachment(name: string) {
    const buffer = this.canvas.toBuffer("image/png");

    return new AttachmentBuilder(buffer, {
      name,
    });
  }

  /**
   * Resets canvas to blank
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    this.ctx.beginPath();

    this.ctx.moveTo(x + radius, y);

    this.ctx.arcTo(x + width, y, x + width, y + radius, radius);

    this.ctx.arcTo(
      x + width,
      y + height,
      x + width - radius,
      y + height,
      radius
    );

    this.ctx.arcTo(x, y + height, x, y + height - radius, radius);

    this.ctx.arcTo(x, y, x + radius, y, radius);

    this.ctx.closePath();
  }

  /**
   * Draw an image on the canvas
   * @example
   * await Portrait.drawImage({
   *  x: 0,
   *
   * });
   * @returns
   */
  async drawImage({
    imageURL,
    x,
    y,
    width,
    height,
    align,
    justify,
    shadow,
    border,
    frame,
  }: ImageOptions) {
    // Load the image
    const image = await loadImage(imageURL);

    // calculate image proportions
    if (!width) width = image.width;
    if (!height) height = image.height;

    if (!x) x = 0;
    if (!y) y = 0;

    // Calculate the x and y coordinates
    if (align === "center") y += this.canvas.height / 2 - height / 2;
    else if (align === "bottom") y += this.canvas.height - height;

    if (justify === "center") x += this.canvas.width / 2 - width / 2;
    else if (justify === "right") x += this.canvas.width - width;

    // Draw the image
    if (frame === 0 || frame === undefined) {
      // shadow
      if (shadow) {
        this.ctx.shadowColor = shadow.color || "rgba(0, 0, 0, 0.8)";
        this.ctx.shadowBlur = shadow.blur;
        this.ctx.shadowOffsetX = shadow.offsetX || 0;
        this.ctx.shadowOffsetY = shadow.offsetY || 0;
      }

      // Draw the border
      if (border?.width) {
        // Draw the shadow
        this.ctx.fillStyle = border.color || "#FFFFFF";

        this.ctx.fillRect(
          x - border.width,
          y - border.width,
          width + border.width * 2,
          height + border.width * 2
        );

        // if there is border, then we delete the shadow for the image
        this.ctx.shadowColor = "transparent";
      }

      this.ctx.drawImage(image, x, y, width, height);
    } else {
      // Draw the shadow
      // shadow
      if (shadow) {
        this.ctx.shadowColor = shadow.color || "rgba(0, 0, 0, 0.8)";
        this.ctx.shadowBlur = shadow.blur;
        this.ctx.shadowOffsetX = shadow.offsetX || 0;
        this.ctx.shadowOffsetY = shadow.offsetY || 0;
      }

      // Draw the border
      if (border?.width) {
        this.ctx.save();

        const curveRadius = Math.min(width, height) * (frame / 100);

        this.roundRect(x, y, width, height, curveRadius);

        this.ctx.clip();

        this.ctx.fillStyle = border.color || "#FFFFFF";

        this.ctx.stroke();

        this.ctx.fillRect(x, y, width, height);

        this.ctx.restore();

        width -= border.width * 2;
        height -= border.width * 2;
        x += border.width;
        y += border.width;
      }

      // Create a rounded rectangle

      this.ctx.save();

      this.ctx.beginPath();

      // Curve radius as a percentage of the image size
      const curveRadius = Math.min(width, height) * (frame / 100);

      this.roundRect(x, y, width, height, curveRadius);

      this.ctx.arc(
        x + width / 2,
        y + height / 2,
        Math.min(width, height) / 2,
        0,
        Math.PI * 2
      );

      this.ctx.clip();

      // Draw the image
      this.ctx.drawImage(image, x, y, width, height);

      this.ctx.restore();
    }

    return this;
  }

  /**
   * Writes a text on the canvas
   * @example
   * await Portrait.writeText({
   *  x: 0,
   *  y: 0,
   *  justify: 'center',
   *  align: 'center',
   *  color: "purple",
   *  shadow: 10,
   *  font: "sans serif"
   * });
   * @returns
   */
  async writeText({
    text,
    font,
    size,
    color = "black",
    x = 0,
    y = 0,
    align,
    justify,
    shadow,
  }: TextOptions) {
    // Set the font
    if (!GlobalFonts.has(font)) console.error(`Font "${font}" is not loaded.`);

    this.ctx.font = `${size}px ${font}`;

    const metrics = this.ctx.measureText(text);

    // Set the text color
    this.ctx.fillStyle = color;

    // Calculate the x and y coordinates
    if (align === "center") y += this.canvas.height / 2 + size / 2;
    else if (align === "bottom") y += this.canvas.height / 2 + size / 2;

    if (justify === "center") x += this.canvas.width / 2 - metrics.width / 2;
    else if (justify === "right") x += this.canvas.width - metrics.width;

    // shadow
    if (shadow) {
      this.ctx.shadowColor = shadow.color || "rgba(0, 0, 0, 0.8)";
      this.ctx.shadowBlur = shadow.blur;
      this.ctx.shadowOffsetX = shadow.offsetX || 0;
      this.ctx.shadowOffsetY = shadow.offsetY || 0;
    }

    // Draw the text
    this.ctx.fillText(text, x, y);

    return this;
  }

  /**
   * Draws a line in the canvas from a to b
   * @example
   * await portrait.drawLine({
   *  width: 10,
   *  a: [10, 10],
   *  b: [30, 30],
   *  color: "#ffffff",
   *  shadow: 15
   * });
   * @returns Portrait
   */
  async drawLine({ width, a, b, color = "#000000", shadow }: LineOptions) {
    // Calculate the x and y coordinates
    if (a.length > 2) return this;
    if (b.length > 2) return this;

    const [AX, AY] = a,
      [BX, BY] = b;

    if (
      typeof AX !== "number" ||
      typeof AY !== "number" ||
      typeof BX !== "number" ||
      typeof BY !== "number"
    )
      return this;

    if (shadow) {
      this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";

      this.ctx.lineWidth = width;

      this.ctx.beginPath();

      this.ctx.moveTo(AX + shadow.blur, AY + shadow.blur);

      this.ctx.lineTo(BX + shadow.blur, BY + shadow.blur);

      this.ctx.stroke();
    }

    // Draw the line

    this.ctx.strokeStyle = color;

    this.ctx.lineWidth = width;

    this.ctx.beginPath();

    this.ctx.moveTo(AX, AY);

    this.ctx.lineTo(BX, BY);

    this.ctx.stroke();

    return this;
  }

  /**
   * Fills an area in the canvas
   * @param options
   * @example
   * await Portrait.fill({
   *  a: [10, 10],
   *  b: [20, 20],
   *  color: "#FFFFFF"
   * });
   * @returns
   */
  async fill(options: FillOptions) {
    const {
      a,
      b,
      color = "#000000", // default color is black
    } = options;
    // Calculate the x and y coordinates
    if (a.length > 2) return this;
    if (b.length > 2) return this;

    const [AX, AY] = a,
      [BX, BY] = b;

    if (
      typeof AX !== "number" ||
      typeof AY !== "number" ||
      typeof BX !== "number" ||
      typeof BY !== "number"
    )
      return this;

    // Fill the rectangle
    this.ctx.fillStyle = color;

    this.ctx.fillRect(AX, AY, BX, BY);

    return this;
  }

  static registerFont(fontPath: string, fontName: string) {
    GlobalFonts.registerFromPath(fontPath, fontName);
  }

  static hasCustomFont(fontName: string) {
    return GlobalFonts.has(fontName);
  }
}
