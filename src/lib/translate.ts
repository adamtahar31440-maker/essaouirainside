import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";

const LANGUAGE_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  ar: "Arabic",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Simplified Chinese",
  ko: "Korean",
  tr: "Turkish",
  he: "Hebrew",
};

let _client: Anthropic | null = null;
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export async function translateFields(
  fields: Record<string, string>,
  targetLocales: string[],
  sourceLocale: string = "fr"
): Promise<Record<string, Record<string, string>>> {
  const entries = Object.entries(fields).filter(([, v]) => v.trim().length > 0);
  if (entries.length === 0) return {};

  const locales = targetLocales.filter((l) => l !== sourceLocale && LANGUAGE_NAMES[l]);
  if (locales.length === 0) return {};

  const properties: Record<string, unknown> = {};
  for (const [field] of entries) {
    properties[field] = {
      type: "object",
      properties: Object.fromEntries(locales.map((l) => [l, { type: "string" }])),
      required: locales,
      additionalProperties: false,
    };
  }

  const sourceText = entries.map(([field, value]) => `${field}: """${value}"""`).join("\n\n");
  const localeList = locales.map((l) => `${l} (${LANGUAGE_NAMES[l]})`).join(", ");
  const sourceLanguageName = LANGUAGE_NAMES[sourceLocale] ?? "French";

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "You are a professional tourism translator for a Morocco travel platform (Essaouira Inside). " +
      `Translate the given ${sourceLanguageName} source fields into every requested target language. ` +
      "Keep proper nouns, brand names, and place names in their original script. " +
      "Preserve tone (warm, informative, tourism-oriented) and any formatting. Do not add commentary.",
    messages: [
      {
        role: "user",
        content: `Translate these ${sourceLanguageName} fields into: ${localeList}.\n\n${sourceText}`,
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties,
          required: Object.keys(properties),
          additionalProperties: false,
        },
      },
    },
  });

  const block = response.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") return {};
  return JSON.parse(block.text) as Record<string, Record<string, string>>;
}
