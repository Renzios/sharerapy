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

async function rerankDocuments(
  query: string,
  documents: MatchDocument[]
): Promise<MatchDocument[]> {
  if (documents.length === 0) return [];

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-5.1",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a strict relevance filter for clinical therapy data.
          
          TASK:
          1. Review the User Query and the list of Document Snippets.
          2. Select ONLY the snippets that contain direct evidence or relevant context to answer the query.
          3. Discard vague, irrelevant, or duplicate information.
          4. Rank the selected snippets by relevance (most relevant first).
          5. Return a JSON object with an array of "ids" for the selected documents. Limit to top 5-7.

          Output Format: { "ids": ["doc_id_1", "doc_id_2"] }
          `
        },
        {
          role: "user",
          content: `QUERY: "${query}"
          
          DOCUMENTS:
          ${documents.map((doc) => `ID: ${doc.id}\nTEXT: ${doc.text.substring(0, 300)}...`).join("\n---\n")}
          `
        }
      ],
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const validIds = result.ids || [];

    // Filter the original documents based on the LLM's selection
    // We preserve the order returned by the LLM (ranking)
    const rerankedDocs = validIds
      .map((id: string) => documents.find((doc) => doc.id === id))
      .filter(Boolean) as MatchDocument[];

    // Fallback: If reranker drops everything (rare), return the top 3 vector matches
    if (rerankedDocs.length === 0) {
      console.log("Reranker dropped all docs, falling back to top 3 vector matches.");
      return documents.slice(0, 3);
    }

    return rerankedDocs;

  } catch (error) {
    console.error("Reranking failed:", error);
    // Fallback to original vector order if AI fails
    return documents.slice(0, 5);
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
          YOUR GOAL: Convert the user's latest query into a standalone, detailed semantic search string.
          INSTRUCTIONS:
          1. Resolve References: Use history to figure out who "he", "she", or "it" refers to.
          2. Clinical Expansion: Add clinical synonyms.
          3. Return ONLY the rewritten query string.
          `
        },
        { 
          role: "user", 
          content: `CONVERSATION HISTORY: ${recentContext}\nCURRENT QUERY: "${originalQuery}"\nREWRITTEN QUERY:` 
        }
      ],
    });
    return response.choices[0].message.content || originalQuery;
  } catch (e) {
    console.error("Query expansion failed, using original:", e);
    return originalQuery;
  }
}

// --- MAIN FUNCTION ---
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

    // 1. EXPAND QUERY
    const expandedQuery = await expandQuery(userQuery, history);
    console.log("Expanded:", expandedQuery);

    // 2. EMBED
    const embeddingResponse = await openaiClient.embeddings.create({
      model: "text-embedding-3-large",
      input: expandedQuery.replace(/\n/g, " "),
    });
    const queryVector = embeddingResponse.data[0].embedding;
    const supabase = await createClient();

    // 3. BROAD SEARCH (Cast a wide net)
    const { data: rpcData, error: matchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: queryVector,
        match_threshold: 0.1, // Low threshold to catch everything remotely relevant
        match_count: 25,
      }
    );

    if (matchError) throw new Error("Failed to retrieve documents");

    const broadDocuments = rpcData as MatchDocument[] | null;

    // 4. RERANK (Filter the net)
    // We pass the *Expanded Query* to the reranker so it understands the full context
    const curatedDocuments = await rerankDocuments(
      expandedQuery, 
      broadDocuments || []
    );

    // 5. FETCH FULL REPORTS (Only for the winners)
    const uniqueReportIds = Array.from(
      new Set(curatedDocuments.map((doc) => doc.report_id))
    );

    const reports = await Promise.all(
      uniqueReportIds.map((id) => readReport(id))
    );

    const reportsMap = new Map<string, Report>(
      reports.map((r) => [r.id, r as Report])
    );

    const sources = curatedDocuments.map((doc) => ({
      ...doc,
      report: reportsMap.get(doc.report_id) || null,
    }));

    let contextText = "";
    if (sources.length > 0) {
      contextText = sources.map((doc) => {
         return `${doc.text}`;
      }).join("\n---\n");
    } else {
      contextText = "No relevant documentation found for this query.";
    }

    const systemPrompt = `
            <system_instructions>
            You are the Therapy Data Assistant. Provide accurate, clinical answers based *strictly* on the provided context.
            
            <final_answer_formatting>
            - PLAIN TEXT ONLY. NO MARKDOWN.
            - Use dashes (-) for lists.
            - Use UPPERCASE for sections.
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