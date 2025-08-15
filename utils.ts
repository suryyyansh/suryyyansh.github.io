import { getCollection, getEntry } from 'astro:content';
import fs from 'fs';
import path from 'path';


export type FileTree = {
  [key: string]: string | FileTree
};

export const readAllFiles = (dir: string) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  let output: FileTree = {};

  for (const file of files) {
    const fullDirPath = path.join(dir, file.name);
    output[file.name] = file.isDirectory() ? readAllFiles(fullDirPath) : '/' + fullDirPath.split('.md')[0];
  }

  return output;
};
