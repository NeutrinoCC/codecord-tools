import { JsonManager } from "../classes/jsonManager";
import fs from "fs";
import path from "path";

const logmgr: Map<string, JsonManager> = new Map();

const logsPath = path.join(__dirname, "..", "public", "logs");

fs.readdirSync(logsPath)
  .filter((file) => file.endsWith(".json"))
  .forEach((file) => {
    try {
      const basename = path.basename(file, ".json");
      const manager = new JsonManager(path.join(logsPath, file));

      logmgr.set(basename, manager);
    } catch (error) {
      console.error(
        "\n[CODECORD] An error ocurred trying to setup output system:\n"
      );

      throw error;
    }
  });

export { logmgr };
