'use server'

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function translateText(text: string, targetLanguage: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OpenAI API key");
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      reasoning:{"effort": "low"},
      input: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text into ${targetLanguage}. Do not add any conversational filler, just return the translated text.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 1,
    });

    const translatedText = response.output_text

    if (!translatedText) {
      throw new Error("No translation returned from OpenAI");
    }

    return translatedText;
    
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to translate text";
    throw new Error(message);
  }
}