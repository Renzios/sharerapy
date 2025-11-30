"use server";

import { createClient } from "@/lib/supabase/server";
import { openai as openaiProvider } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import OpenAI from "openai";
import { readReport } from "@/lib/data/reports";

interface MatchDocument {
  id: string;
  report_id: string;
  text: string;
  similarity: number;
}

interface Report {
  id: string;
  [key: string]: unknown;
}

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function generateAnswer(
  userQuery: string,
  history: ChatMessage[] = []
) {
  if (!userQuery) {
    return { error: "Query is required" };
  }

  try {
    const embeddingResponse = await openaiClient.embeddings.create({
      model: "text-embedding-3-large",
      input: userQuery.replace(/\n/g, " "),
    });

    const queryVector = embeddingResponse.data[0].embedding;
    const supabase = await createClient();

    const { data: rpcData, error: matchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: queryVector,
        match_threshold: 0.3,
        match_count: 5,
      }
    );

    if (matchError) {
      throw new Error("Failed to retrieve documents");
    }

    const documents = rpcData as MatchDocument[] | null;

    const uniqueReportIds = Array.from(
      new Set((documents || []).map((doc) => doc.report_id))
    );

    const reports = await Promise.all(
      uniqueReportIds.map((id) => readReport(id))
    );

    const reportsMap = new Map<string, Report>(
      reports.map((r) => [r.id, r as Report])
    );

    const sources = (documents || []).map((doc) => ({
      ...doc,
      report: reportsMap.get(doc.report_id) || null,
    }));

    let contextText = "";

    if (sources.length > 0) {
      contextText = sources.map((doc) => doc.text).join("\n---\n");
    } else {
      contextText = "No relevant documentation found for this query.";
    }

    const systemPrompt = `
            You are a helpful and precise assistant designed to analyze reports.
            
            Instructions:
            1. Answer the user's question based ONLY on the provided Context.
            2. If the answer is not in the Context, explicitly state "I cannot find sufficient information in the reports."
            
            Context:
            ${contextText}
        `;

    const recentHistory = history.slice(-6).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const stream = createStreamableValue("");

    (async () => {
      const { textStream } = await streamText({
        model: openaiProvider("gpt-4o"),
        messages: [
          { role: "system", content: systemPrompt },
          ...recentHistory,
          { role: "user", content: userQuery },
        ],
      });

      for await (const delta of textStream) {
        stream.update(delta);
      }

      stream.done();
    })();

    return {
      success: true,
      sources,
      output: stream.value,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
