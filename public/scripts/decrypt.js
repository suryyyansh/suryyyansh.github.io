async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"]
  );
}

async function decryptWriteup(flag, ciphertext, iv, salt) {
  try {
    const key = await deriveKey(flag, salt);
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const hash = await crypto.subtle.digest("SHA-256", rawKey);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return null; // Wrong flag
  }
}

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);

    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export { decryptWriteup, base64ToArrayBuffer };