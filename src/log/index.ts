import { logmgr } from "./msgMgr";
import { Locale } from "discord.js";

const defaultLocale = "en-GB";

interface LogOptions {
  lang?: Locale;
  replacements?: { [key: string]: string };
}

export function getLog(code: string, lang?: Locale) {
  // get the language log manager
  let _mgr =
    (lang ? logmgr.get(lang) : logmgr.get(defaultLocale)) ||
    logmgr.get(defaultLocale);

  if (!_mgr)
    throw new Error(
      `[Codecord] No logs detected on library. Can't output anything.`
    );

  // get the code
  try {
    let msg: string = _mgr.getSync(code) || "No Result";

    return msg;
  } catch (error) {
    console.log(error);

    return "Error";
  }
}

export function log(code: string, options?: LogOptions) {
  // get the language log manager
  let msg = getLog(code, options?.lang);

  // replace keys
  if (options?.replacements)
    for (const [key, value] of Object.entries(options.replacements))
      msg = msg.replace(`{${key}}`, value);

  let group = String(code.split(".")[0]).toUpperCase();

  msg = `[CC-LIB:${group}] ${msg}`;

  const addCode = () => (msg += "\nLog code:" + code);

  switch (group) {
    case "WARN":
    case "ERROR":
      addCode();
  }

  console.log(msg);

  return msg;
}

log.error = (code: string, options?: LogOptions) =>
  new Error(log(code, options));
