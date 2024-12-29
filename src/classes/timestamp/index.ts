import { isFormatKey, TimestampType } from "./type";

export class Timestamp {
  /**
   *
   * @param date
   * @param timestampType Use TimestampType enum
   * @returns
   */
  static fromDate = (date: Date, timestampType?: TimestampType) =>
    `<t:${(date.getTime() / 1000).toFixed(0)}:${timestampType || "F"}>`;

  static type = TimestampType;

  /**
   * @example
   * Timestamp.stringToDate('01/01/2000', 'dd/mm/yyyy'); // returns date Object
   */
  static stringToDate(dateString: string, format: string): Date | null {
    const formats = {
      yyyy: "(\\d{4})",
      mm: "(\\d{2})",
      dd: "(\\d{2})",
      hh: "(\\d{2})",
      ii: "(\\d{2})",
      ss: "(\\d{2})",
    };

    let regex = format;

    Object.keys(formats).forEach((key) => {
      if (!isFormatKey(key)) return;
      regex = regex.replace(new RegExp(key, "g"), formats[key]);
    });

    const match = dateString.match(new RegExp(`^${regex}$`));

    // Check if match is defined and is an array
    if (!match || !Array.isArray(match)) return null;

    // Check for required indices
    if (match.length < 7 || !match[1]) return null;

    let year = parseInt(match[1], 10);

    // Check for month, day, hour, minute, second
    let month = match[2] !== undefined ? parseInt(match[2], 10) : null;
    let day = match[3] !== undefined ? parseInt(match[3], 10) : null;
    let hour = match[4] !== undefined ? parseInt(match[4], 10) : null;
    let minute = match[5] !== undefined ? parseInt(match[5], 10) : null;
    let second = match[6] !== undefined ? parseInt(match[6], 10) : null;

    // Further checks if month, day, hour, minute, and second are valid
    if (
      month === null ||
      isNaN(month) ||
      day === null ||
      isNaN(day) ||
      hour === null ||
      isNaN(hour) ||
      minute === null ||
      isNaN(minute) ||
      second === null ||
      isNaN(second)
    ) {
      return null;
    }

    month -= 1;

    return new Date(year, month, day, hour, minute, second);

    // Adjust month (JavaScript months are 0-based)
  }
}
