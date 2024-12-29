export type FormatKey = "yyyy" | "mm" | "dd" | "hh" | "ii" | "ss";

export const isFormatKey = (key: string): key is FormatKey => true;

export enum TimestampType {
  relative = "R",
  shortTime = "s",
  longTime = "S",
  shortDate = "d",
  longDate = "D",
  longDateAndShortTime = "f",
  longDateAndLongTime = "F",
}
