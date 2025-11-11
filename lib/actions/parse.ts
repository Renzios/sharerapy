"use server"

import OpenAI from "openai";

export async function parseFile(file: File): Promise<string> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');

    const response = await openai.responses.create({
        model: "gpt-5",
        input: [
            {
                role: "user",
                content: [
                    {
                        type: "input_file",
                        filename: file.name,
                        file_data: `data:application/pdf;base64,${base64String}`,
                    },
                    {
                        type: "input_text",
                        text: `Convert this PDF document into clean, well-formatted Markdown. Use these Markdown elements:
- # for main headings, ## for subheadings, ### for sub-subheadings
- Regular paragraphs for body text
- --- for horizontal rules/section breaks
- Numbered lists: 1. 2. 3.
- Unordered lists: - or *
- Tables using Markdown table syntax with | and -

Preserve the document structure and formatting. Return ONLY the Markdown content without any code blocks, explanations, or wrapper text.`,
                    },
                ],
            },
        ],
    });

    const markdown = response.output_text || "";
    
    return markdown.trim();
}