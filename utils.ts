import fs from 'fs';
import path from 'path';

export type FileTree = {
  [key: string]: null | FileTree
};

export const readAllFiles = (dir: string) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  let output: FileTree = {};

  for (const file of files) {
    if (file.isDirectory()) {
      const fullDirPath = path.join(dir, file.name);
      output[file.name] = readAllFiles(fullDirPath);
    } else {
      output[file.name] = null;
    }
  }

  return output;
};