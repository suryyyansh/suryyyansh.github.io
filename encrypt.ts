// AES-GCM + PBKDF2 encryption (WebCrypto API)
import { marked } from 'marked';
import { glob } from 'glob';
import fs from 'fs';

import { webcrypto } from "crypto";
const { subtle } = webcrypto;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    "raw",
    enc.encode(password), // UTF-8 encoding of password
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 250000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
}

export async function encryptWriteup(writeup: string, password: string) {
  const enc = new TextEncoder();
  const plaintext = enc.encode(writeup);

  // Generate random salt (16 bytes) and IV (12 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  // Encrypt — WebCrypto automatically appends the 16-byte tag to ciphertext
  const ciphertextBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  // Encode outputs as base64 for embedding in HTML
  const ciphertextB64 = bufferToBase64(ciphertextBuffer);
  const saltB64 = bufferToBase64(salt.buffer);
  const ivB64 = bufferToBase64(iv.buffer);

  return {
    encrypted_writeup: ciphertextB64, // ciphertext + tag
    salt: saltB64,
    iv: ivB64,
  };
}

// Helpers
function bufferToBase64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/*
  Every route can have one "encrypted" folder inside,
  which defines which will include plaintext versions of
  the writeups which require encryption.

  The encrypted versions of these writeups will be 
  produced here and moved one directory up
*/

function extract_frontmatter(content: string): string[] {
  return content.split("\n---\n")
}

const encrypted_files = await glob('./writeups/**/encrypted/*.md')

for (const item of encrypted_files) {
  const data = fs.readFileSync(item, "utf-8");
  const [fm, ...md_arr] = extract_frontmatter(data);
  const md = md_arr.join("\n---\n");

  const match = fm.match(/flag:\s*([^\s]+)/);
  const flagless_fm = fm.replace(/\n?flag:\s*([^\s]+)/, "")
  if (!match) {
    console.error("No flag found. Please add a flag to EVERY encrypted file.")
    console.error("Flag not found on file: " + item)
    process.exit(1);
  }
  // Trim shouldn't be required, but just in case
  let password = match[1].trim();
  
  const html = await marked.parse(md);
  const encrypted_writeup = await encryptWriteup(html, password);
  const encrypted_item_location = item.replace("\/encrypted\/", "\/")
  fs.writeFileSync(encrypted_item_location, flagless_fm + "\n---\n" + JSON.stringify(encrypted_writeup))
  console.log('Encrypted writeup: ' + encrypted_item_location)
}