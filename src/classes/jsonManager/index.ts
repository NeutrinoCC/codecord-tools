import { access } from "../../functions/files";
import fsPromises from "fs/promises";
import fs from "fs";
import path from "path";

export class JsonManager {
  filePath: string;
  name: string;

  /**
   * Creates a new instance of Json Manager
   * @param _path Configuration file path
   */
  constructor(_path: string) {
    // get absolute path
    const absolutePath = path.isAbsolute(_path)
      ? _path
      : path.join(process.cwd(), _path);

    // get dirname
    const dirname = path.dirname(absolutePath);

    // validate if dirname exists
    if (!fs.existsSync(dirname))
      throw new Error(`[JSON MANAGER] Directory "${dirname}" doesn't exist.`);

    this.filePath = absolutePath;

    this.name = path.basename(absolutePath, ".json");

    // check if the configuration file is already created.
    if (!fs.existsSync(absolutePath)) {
      // create a new configuration file if not.
      this._writeJsonFile({});
    }
  }

  private _writeJsonFile(data: any) {
    if (!data) return;

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  private async _readJsonFile() {
    if (!access(this.filePath)) this._writeJsonFile({});

    const fileData = await fsPromises.readFile(this.filePath, "utf8");
    const content: any = JSON.parse(fileData);

    return content;
  }

  async get(query?: string) {
    const data = await this._readJsonFile();

    if (!query) return data;

    const keys = query.split(".");

    let current = data;

    // Traverse the object to find each key
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else if (current !== undefined) {
        current = undefined;
      } else {
        throw new Error(
          `[JsonManagerError] "${query}" doesn't exist on: ${this.name}`
        );
      }
    }

    return current;
  }

  getSync(query?: string) {
    const data = this._readSync();

    if (!query) return data;

    const keys = query.split(".");

    let current: any = data;

    // Traverse the object to find each key
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else if (current !== undefined) {
        current = undefined;
      } else {
        throw new Error(
          `[JsonManagerError] "${query}" doesn't exist on: ${this.name}`
        );
      }
    }

    return current;
  }

  async push(query: string, value: any) {
    const data = await this._readJsonFile();

    const keys = query.split(".");

    let current = data;

    if (keys?.[0] === "" && Array.isArray(current)) {
      current.push(value);

      this._writeJsonFile(current);

      return;
    }

    // Traverse the object to find the array to push to
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (!key) return;

      if (i === keys.length - 1) {
        // Check if the property exists and is an array

        if (!current[key] || !Array.isArray(current[key])) {
          throw new Error(
            `[[JsonManagerError] Property '${key}' is not an array at '${this.name}'`
          );
        }

        current[key].push(value);
      } else {
        // If the key doesn't exist, create a new object

        if (!current[key] || typeof current[key] !== "object") {
          throw new Error(
            `[JsonManagerError] "${query}" doesn't exist on: ${this.name}`
          );
        }

        // Move to the next nested object

        current = current[key];
      }
    }

    this._writeJsonFile(data);
  }

  async set(query: string, value: any) {
    let data = await this._readJsonFile();

    if (query == "") return this._writeJsonFile(value);

    const keys = query.split(".");
    let current = data;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (!key) return;

      // If we're at the last key, set the value
      if (i === keys.length - 1) {
        current[key] = value;
      } else {
        // If the key doesn't exist, create a new object
        if (!current[key] || typeof current[key] !== "object") {
          current[key] = {};
        }
        // Move to the next nested object
        current = current[key];
      }
    }

    this._writeJsonFile(data);
  }

  async delete(query: string) {
    let data = await this._readJsonFile();

    const keys = query.split(".");
    const lastKey = keys.pop(); // Get last key for deletion
    let current = data;

    if (!lastKey) return;

    // Traverse the object to find the last key's parent
    for (const key of keys) {
      if (current[key] && typeof current[key] === "object") {
        current = current[key];
      } else {
        throw new Error(
          `[JsonManagerError] "${query}" doesn't exist on: ${this.name}`
        );
      }
    }

    // Delete the target property if it exists
    if (lastKey in current) {
      delete current[lastKey];
    } else {
      throw new Error(
        `[JsonManagerError] "${query}" doesn't exist on: ${this.name}`
      );
    }

    this._writeJsonFile(data);
  }

  private _readSync() {
    const jsonData = fs.readFileSync(this.filePath, "utf8");
    const data: { [key: string]: any } = JSON.parse(jsonData);

    return data;
  }

  has(query: string) {
    if (!access(this.filePath)) this._writeJsonFile({});

    const jsonData = fs.readFileSync(this.filePath, "utf8");
    const data: { [key: string]: any } = JSON.parse(jsonData);

    const keys = query.split(".");
    let current = data;

    // Traverse the object to find each key
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return false; // Return false if any key doesn't exist
      }
    }

    return true; // Every key in the path exists
  }
}
