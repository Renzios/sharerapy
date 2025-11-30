"use client";

/* React Hooks & NextJS Utilities */
import { useState, useRef, useEffect } from "react";

/* Components */
import Search from "@/components/general/Search";
import { SourceList, Source } from "@/components/cards/SourceCard";

/* Actions */
import { generateAnswer } from "@/lib/actions/chatbot";

/* Contexts */
import { useTherapistProfile } from "@/app/contexts/TherapistProfileContext";

/* Icons */
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

/* Others */
import { readStreamableValue } from "@ai-sdk/rsc";

interface Message {
  role: "user" | "ai";
  content: string;
  sources?: Source[];
}

export default function AIModePage() {
  const { therapist } = useTherapistProfile();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputQuery, setInputQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async (query: string) => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setInputQuery("");

    const newUserMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, newUserMsg]);

    const historyForServer = messages.map(
      (m) =>
        ({
          role: m.role === "ai" ? "assistant" : "user",
          content: m.content,
        } as { role: "user" | "assistant"; content: string })
    );

    try {
      const result = await generateAnswer(query, historyForServer);

      if (!result.success || !result.output) {
        throw new Error(result.error || "Failed to generate response");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "",
          sources: result.sources as Source[],
        },
      ]);

      for await (const delta of readStreamableValue(result.output)) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMsg = newMessages[lastIndex];

          if (lastMsg.role === "ai") {
            newMessages[lastIndex] = {
              ...lastMsg,
              content: (lastMsg.content || "") + delta,
            };
          }

          return newMessages;
        });
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Sorry, I encountered an error while processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasStarted = messages.length > 0;

  return (
    <div
      className={`
        flex flex-col min-h-full items-center w-full
        ${!hasStarted ? "justify-center" : "justify-start"}
      `}
    >
      {!hasStarted && (
        <div className="flex flex-col items-center mb-6 text-center px-4">
          <h1 className="py-2 text-3xl md:text-5xl font-Noto-Sans font-semibold bg-clip-text text-transparent bg-[linear-gradient(270deg,#77A5EE_0%,#1859C1_50%,#77A5EE_100%)]">
            Hello, {therapist?.first_name || "Therapist"}
          </h1>
          <p className="text-darkgray font-Noto-Sans mt-1 text-base md:text-lg">
            Ask questions about your reports and patient history.
          </p>
        </div>
      )}

      {hasStarted && (
        <div className="flex-1 flex flex-col gap-8 max-w-4xl mx-auto w-full pb-10 px-4 md:px-0">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-5 py-3 rounded-4xl max-w-[95%] md:max-w-[80%] text-base leading-relaxed whitespace-pre-wrap font-Noto-Sans ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-bordergray text-gray-800 rounded-bl-sm"
                }`}
              >
                {msg.content}
                {isLoading &&
                  idx === messages.length - 1 &&
                  msg.content === "" && (
                    <span className="inline-block w-1 h-4 bg-darkgray animate-pulse ml-1" />
                  )}
              </div>

              {msg.role === "ai" && msg.sources && msg.sources.length > 0 && (
                <div className="max-w-[95%] md:max-w-[85%] mt-2 w-full overflow-hidden">
                  <SourceList sources={msg.sources} />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div
        className={`
          w-full flex justify-center z-20
          ${
            !hasStarted
              ? ""
              : "sticky bottom-0 pt-4 pb-2 bg-background/80 backdrop-blur-sm"
          } 
        `}
      >
        <div className="w-[95%] md:w-[75%]">
          <Search
            value={inputQuery}
            size="full"
            onChange={setInputQuery}
            onSearch={handleSearch}
            aiMode={false}
            placeholder="Ask a question..."
            id="ai-mode-search-input"
            icon={<AutoAwesomeIcon className="w-5 h-5 hover:cursor-pointer" />}
          />
        </div>
      </div>
    </div>
  );
}
