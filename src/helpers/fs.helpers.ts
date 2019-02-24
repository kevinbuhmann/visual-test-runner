import * as fs from 'fs';
import * as path from 'path';

export function readTextFile(filePath: string) {
  return fs.readFileSync(filePath).toString();
}

export function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);

  if (!fs.existsSync(dirname) || !fs.statSync(dirname).isDirectory()) {
    ensureDirectoryExists(dirname);
    fs.mkdirSync(dirname);
  }
}
