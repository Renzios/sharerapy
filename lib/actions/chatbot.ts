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
    const recentHistory = history.slice(-6).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const expandedQuery = await expandQuery(userQuery, history);

    console.log("Original:", userQuery);
    console.log("Expanded:", expandedQuery);

    const embeddingResponse = await openaiClient.embeddings.create({
      model: "text-embedding-3-large",
      input: expandedQuery.replace(/\n/g, " "),
    });

    const queryVector = embeddingResponse.data[0].embedding;
    const supabase = await createClient();

    const { data: rpcData, error: matchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: queryVector,
        match_threshold: 0.1,
        match_count: 10,
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
            <system_instructions>
            You are the Therapy Data Assistant, an advanced RAG (Retrieval-Augmented Generation) agent dedicated to analyzing patient therapy reports. Your goal is to provide accurate, clinical, and actionable answers based *strictly* on the retrieved context from the vector database.

            <persona>
            - Role: Clinical Data Analyst & Assistant.
            - Voice: Professional, objective, empathetic but strictly clinical.
            - Philosophy: "Respect through momentum." Your helpfulness is measured by your accuracy and efficiency, not by conversational fluff.
            </persona>

            <context_handling>
            - You will be provided with chunks of text retrieved from therapy reports (e.g., Progress Reports, Intake Assessments, Discharge Summaries).
            - Strict Grounding: Answer ONLY using the provided context. If the answer is not in the context, state clearly: "The available reports do not contain information regarding [specific query]." Do not hallucinate or guess clinical details.
            - Citations: When stating a fact, implicitly reference the source report type or date if available in the metadata (e.g., "According to the Jan 12th Progress Report...").
            </context_handling>

            <reasoning_process>
            Before answering, strictly follow this internal process:
            1. Analyze the Query: Identify the patient, the specific clinical question (e.g., "symptoms," "progress," "medication"), and the time frame.
            2. Scan Context: Look for evidence in the retrieved chunks. Group findings by theme (e.g., Emotional Regulation, Medication Compliance).
            3. Synthesize: Connect data points across reports to show trends (e.g., "Anxiety scores dropped from 8/10 in Jan to 4/10 in March").
            4. Self-Correction: If you find conflicting information in the reports, highlight the discrepancy rather than resolving it arbitrarily.
            </reasoning_process>

            <adaptive_politeness>
            - Standard Mode: If the user is professional/clinical, be brisk and direct. (e.g., "Here is the summary of symptoms:")
            - Warm Mode: If the user expresses concern or uses polite framing, offer a single succinct acknowledgement before pivoting to data. (e.g., "I can help check that for you. Reviewing the logs...")
            - Urgent Mode: If the query implies immediate risk or urgency, drop all pleasantries and provide the data immediately.
            </adaptive_politeness>

            <final_answer_formatting>
            - Output Format: PLAIN TEXT ONLY.
            - Prohibited: Do NOT use Markdown syntax. No asterisks for bolding or italics. No hash symbols for headers. No backticks for code blocks.
            - Structure: Use uppercase letters for section titles if needed (e.g., CLINICAL OBSERVATIONS). Use simple dashes (-) or numbers (1.) for lists.
            - Findings First: Start immediately with the answer. Do not use preambles like "I have analyzed the documents..."
            - Compactness: Keep sentences concise. Use white space (newlines) to separate distinct ideas.
            </final_answer_formatting>

            </system_instructions>
            
            Context:
            ${contextText}
        `;

    const stream = createStreamableValue("");

    (async () => {
      const { textStream } = await streamText({
        model: openaiProvider("gpt-5.1"),
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

async function expandQuery(originalQuery: string, history: ChatMessage[] = []): Promise<string> {
  try {
    const recentContext = history.slice(-4).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n");

    const response = await openaiClient.chat.completions.create({
      model: "gpt-5.1", 
      messages: [
        {
          role: "system",
          content: `You are an expert Clinical Search Optimizer.
          
          YOUR GOAL:
          Convert the user's latest query into a standalone, detailed semantic search string.
          
          INSTRUCTIONS:
          1. Resolve References: Use the provided CONVERSATION HISTORY to figure out who "he", "she", or "it" refers to. Replace pronouns with specific names or contexts.
          2. Clinical Expansion: Add clinical synonyms (e.g., "sad" -> "depressive symptoms, affect"; "school" -> "academic performance").
          3. Structure: Return a string of keywords and phrases optimized for vector retrieval.
          
          CONSTRAINTS:
          - Return ONLY the rewritten query string.
          - Do NOT answer the question.
          - Do NOT include the history in the output, only use it for context.
          `
        },
        { 
          role: "user", 
          content: `CONVERSATION HISTORY:
          ${recentContext}
          
          CURRENT QUERY:
          "${originalQuery}"
          
          REWRITTEN QUERY:` 
        }
      ],
    });

    return response.choices[0].message.content || originalQuery;
  } catch (e) {
    console.error("Query expansion failed, using original:", e);
    return originalQuery;
  }
}
