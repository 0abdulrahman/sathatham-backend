import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { promisify } from "util";

/**
 * Constructs the absolute file path based on the provided fileName and savePath.
 * Resolves the path relative to the directory of the current module.
 * @param {string} fileName - The name of the file including its extension.
 * @param {string} savePath - The directory path where the file should be saved.
 * @returns {string} The absolute file path.
 * @throws {Error} Throws an error if savePath or fileName is empty, or if savePath does not exist.
 */
export default async function getPathName(fileName: string, savePath: string): Promise<string> {
  // Ensure cross-platform compatibility for path separation ('/', '\')
  const folders = savePath.split(path.sep);

  // Resolve the current module's directory path by going two levels up from __filepath
  const __filepath = path.resolve(__dirname, "..", "..", "..");

  // Validate and resolve the save directory path
  const saveDir = path.resolve(__filepath, ...folders);
  // If the directory doesn't exist, create it.
  if (!(await promisify(fs.exists)(saveDir))) await promisify(fs.mkdir)(saveDir, { recursive: true });

  // Construct and return the absolute file path
  const absolutePath = path.join(saveDir, fileName);
  return absolutePath;
}
