import OpenAI from "openai";
import { NextResponse } from "next/server";

const MAX_BIO_LENGTH = 160;
const EXPECTED_BIO_COUNT = 5;
const VALID_TONES = ["professional", "fun", "bold", "minimalist"] as const;

type Tone = (typeof VALID_TONES)[number];

type RequestBody = {
  profession?: string;
  keywords?: string[];
  tone?: Tone;
};

type LlmResponse = {
  bios?: string[];
};

const trimToMax = (value: string) => value.trim().slice(0, MAX_BIO_LENGTH);

const sanitizeBios = (bios: string[]) =>
  bios
    .map(trimToMax)
    .filter(Boolean)
    .slice(0, EXPECTED_BIO_COUNT);

const parsePlainTextBios = (rawContent: string) => {
  const lines = rawContent
    .split("\n")
    .map((line) => line.replace(/^\s*\d+[).:-]?\s*/, "").trim())
    .filter(Boolean);

  return sanitizeBios(lines);
};

const parseModelContent = (rawContent: string) => {
  try {
    const parsed = JSON.parse(rawContent) as LlmResponse;
    return sanitizeBios(parsed.bios ?? []);
  } catch {
    return parsePlainTextBios(rawContent);
  }
};

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as RequestBody;
    const profession = body.profession?.trim();
    const keywords = body.keywords?.map((keyword) => keyword.trim()).filter(Boolean) ?? [];
    const tone = body.tone;

    if (!profession || keywords.length !== 3 || !tone || !VALID_TONES.includes(tone)) {
      return NextResponse.json(
        { error: "Please provide profession, exactly 3 keywords, and a valid tone." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "bio_options",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              bios: {
                type: "array",
                minItems: EXPECTED_BIO_COUNT,
                maxItems: EXPECTED_BIO_COUNT,
                items: {
                  type: "string",
                  maxLength: MAX_BIO_LENGTH
                }
              }
            },
            required: ["bios"]
          }
        }
      },
      messages: [
        {
          role: "system",
          content:
            "You write concise profile bios. Return exactly five distinct options, each under 160 characters, and do not include hashtags or emoji unless requested."
        },
        {
          role: "user",
          content: `Profession: ${profession}\nKeywords: ${keywords.join(", ")}\nTone: ${tone}`
        }
      ]
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json({ error: "No bios were returned. Please try again." }, { status: 502 });
    }

    const bios = parseModelContent(rawContent);

    if (bios.length !== EXPECTED_BIO_COUNT) {
      return NextResponse.json({ error: "Model returned incomplete bios. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ bios });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json({ error: "Rate limit reached. Please try again in a moment." }, { status: 429 });
      }

      return NextResponse.json(
        { error: error.message || "OpenAI request failed. Please try again." },
        { status: error.status ?? 500 }
      );
    }

    return NextResponse.json({ error: "Unable to generate bios right now." }, { status: 500 });
  }
}
