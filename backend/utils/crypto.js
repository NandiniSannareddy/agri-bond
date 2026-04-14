import crypto from "crypto";

const algorithm = "aes-256-ctr";
const secret = process.env.CRYPTO_SECRET;

// ✅ MUST be 32 bytes
const secretKey = crypto
  .createHash("sha256")
  .update(String(secret))
  .digest(); // 32 bytes

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    algorithm,
    secretKey,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decrypt = (hash) => {
  try {
    const [ivHex, contentHex] = hash.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const content = Buffer.from(contentHex, "hex");

    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      iv
    );

    const decrypted = Buffer.concat([
      decipher.update(content),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (err) {
    return "";
  }
};