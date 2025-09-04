import { getCollection, type CollectionEntry } from 'astro:content';
import fs from 'fs';
import path from 'path';


export type FileTree = {
  [key: string]: string | FileTree
};

export async function buildFileTree(): Promise<FileTree> {
  let output: FileTree = {};
  const entries = await getAllPosts();
  for (const entry of entries) {
    // filepath looks like: writeups/htb/machines/encryption_test.md
    const parts = entry.filePath? entry.filePath?.split("/") : ""; 
    let current = output;

    // i=1 to skip the root folder
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      if (i === parts.length - 1) {
        // last part = file
        let name = part.replace(/\.[^/.]+$/, "");
        name = entry.data.flagProtected ?  name + " 🔒" : name;
        current[name] =
          "/" + normalizeFileName(entry.filePath ? entry.filePath : "");
      } else {
        // intermediate = folder
        if (!current[part]) current[part] = {};
        current = current[part] as FileTree;
      }
    }
  }
  return output;
}

export const getAllPosts = async () => {
  const htb_machines_posts = await getCollection('htb_machines');
  const htb_challenges_posts = await getCollection('htb_challenges');
  // Need to find a better way to coalesce posts while ensuring schematic correctness
  const posts = [...htb_machines_posts, ...htb_challenges_posts]
  return posts
}

export const normalizeFileName = (name: string) => { 
  return name.replace(/(\s)+/g, "-").replace(/\.[^/.]+$/, "").toLowerCase();
}