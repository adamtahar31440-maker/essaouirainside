import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";

let _client: Anthropic | null = null;
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export type ExtractedProduct = { name: string; price: number | null };

export async function extractProductsFromImages(
  images: { mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; base64: string }[]
): Promise<ExtractedProduct[]> {
  if (images.length === 0) return [];

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "You extract menu items, products, or price-list entries from photos of physical documents " +
      "(restaurant menus, hairdresser price lists, shop price tags, activity price boards, etc.) for a " +
      "Morocco tourism business directory. Read every item name and its price if visible. Extract the " +
      "numeric price exactly as written (no currency conversion). If a price isn't shown for an item, " +
      "use null. Keep item names in the language they're written in. Ignore headers, decorative text, " +
      "addresses, phone numbers, and anything that isn't an actual product/service/price entry.",
    messages: [
      {
        role: "user",
        content: [
          ...images.map((img) => ({
            type: "image" as const,
            source: { type: "base64" as const, media_type: img.mediaType, data: img.base64 },
          })),
          {
            type: "text" as const,
            text: "Extract every product/service and its price from these document photos.",
          },
        ],
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: ["number", "null"] },
                },
                required: ["name", "price"],
                additionalProperties: false,
              },
            },
          },
          required: ["items"],
          additionalProperties: false,
        },
      },
    },
  });

  const block = response.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") return [];
  try {
    const parsed = JSON.parse(block.text) as { items: ExtractedProduct[] };
    return parsed.items ?? [];
  } catch {
    return [];
  }
}
