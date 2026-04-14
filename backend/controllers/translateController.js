import { translateText } from "../utils/translator.js";

export const translate = async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ message: "Missing data" });
    }

    const translated = await translateText(text, targetLang);

    res.json({ text: translated });
  } catch (err) {
    console.log("TRANSLATE ERROR:", err);
    res.status(500).json({ message: "Translation failed" });
  }
};