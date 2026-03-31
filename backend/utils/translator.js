import https from "https";
import http from "http";

export async function translateText(text, targetLang) {
  try {
    if (!text) return text;

    const encodedText = encodeURIComponent(text);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`;

    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === "https:" ? https : http;

    return new Promise((resolve) => {
      const req = protocol.request(parsedUrl, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            const translated = parsed[0]
              .map((item) => item[0])
              .join("");

            resolve(translated);
          } catch {
            resolve(text);
          }
        });
      });

      req.on("error", () => resolve(text));
      req.end();
    });
  } catch {
    return text;
  }
}