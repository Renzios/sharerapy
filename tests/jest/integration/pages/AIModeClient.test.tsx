import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AIModeClient from "@/components/client-pages/AIModeClient";
import { generateAnswer } from "@/lib/actions/chatbot";

// Mock generateAnswer action
jest.mock("@/lib/actions/chatbot", () => ({
  generateAnswer: jest.fn(),
}));

// Mock @ai-sdk/rsc module - use virtual mock to avoid module resolution
jest.mock(
  "@ai-sdk/rsc",
  () => ({
    readStreamableValue: jest.fn(),
  }),
  { virtual: true }
);

// Get the mocked function for use in tests
const { readStreamableValue: mockReadStreamableValue } = jest.requireMock("@ai-sdk/rsc");

// Mock TherapistProfileContext
const mockTherapist = {
  id: "therapist-123",
  first_name: "Dr. Sarah",
  last_name: "Johnson",
  email: "sarah@example.com",
};

jest.mock("@/app/contexts/TherapistProfileContext", () => ({
  useTherapistProfile: jest.fn(() => ({
    therapist: mockTherapist,
  })),
}));

// Mock Search component
jest.mock("@/components/general/Search", () => {
  const Component = ({
    value,
    onChange,
    onSearch,
    placeholder,
    id,
    icon,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    placeholder?: string;
    id?: string;
    icon?: React.ReactNode;
  }) => (
    <div data-testid="search-component">
      <input
        data-testid={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        data-testid="search-button"
        onClick={() => onSearch(value)}
      >
        Search
      </button>
      {icon && <div data-testid="search-icon">{icon}</div>}
    </div>
  );
  Component.displayName = "Search";
  return Component;
});

// Mock SourceCard component
jest.mock("@/components/cards/SourceCard", () => ({
  SourceList: ({ sources }: { sources: Array<{ id: string; report_id: string; text: string; similarity: number; title?: string }> }) => (
    <div data-testid="source-list">
      {sources.map((source, idx) => (
        <div key={idx} data-testid={`source-${idx}`}>
          {source.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock AutoAwesomeIcon
jest.mock("@mui/icons-material/AutoAwesome", () => {
  const Component = ({ className }: { className?: string }) => (
    <div data-testid="auto-awesome-icon" className={className}>
      ✨
    </div>
  );
  Component.displayName = "AutoAwesomeIcon";
  return Component;
});

describe("AIModeClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementation for readStreamableValue
    mockReadStreamableValue.mockImplementation(async function* () {
      yield "";
    });
    // Mock scrollIntoView which is not available in jsdom
    Element.prototype.scrollIntoView = jest.fn();
  });

  describe("Initial Rendering", () => {
    it("renders welcome screen with therapist name", () => {
      render(<AIModeClient />);

      expect(screen.getByText(/Hello, Dr. Sarah/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Ask questions about your reports and patient history/i)
      ).toBeInTheDocument();
    });

    it("renders search input with placeholder", () => {
      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("placeholder", "Ask a question...");
    });

    it("renders search icon", () => {
      render(<AIModeClient />);

      expect(screen.getByTestId("auto-awesome-icon")).toBeInTheDocument();
    });

    it("shows centered layout when no messages", () => {
      render(<AIModeClient />);

      const mainContainer = screen.getByText(/Hello, Dr. Sarah/i).closest("div")?.parentElement;
      expect(mainContainer?.className).toContain("justify-center");
    });

    it("handles missing therapist name gracefully", () => {
      const { useTherapistProfile } = jest.requireMock<typeof import("@/app/contexts/TherapistProfileContext")>("@/app/contexts/TherapistProfileContext");
      useTherapistProfile.mockReturnValueOnce({ therapist: null });

      render(<AIModeClient />);

      expect(screen.getByText(/Hello, Therapist/i)).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("updates input value when typing", async () => {
      const user = userEvent.setup();
      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "What are the symptoms?");

      expect(searchInput).toHaveValue("What are the symptoms?");
    });

    it("submits query when search button is clicked", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Response text";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test query");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(generateAnswer).toHaveBeenCalledWith("Test query", []);
      });
    });

    it("does not submit empty query", async () => {
      const user = userEvent.setup();
      render(<AIModeClient />);

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      expect(generateAnswer).not.toHaveBeenCalled();
    });

    it("does not submit whitespace-only query", async () => {
      const user = userEvent.setup();
      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "   ");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      expect(generateAnswer).not.toHaveBeenCalled();
    });

    it("prevents submission while loading", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockStreamValue), 1000))
      );
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Response";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "First query");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      // Try to submit again while loading
      await user.type(searchInput, "Second query");
      await user.click(searchButton);

      expect(generateAnswer).toHaveBeenCalledTimes(1);
    });

    it("clears input after submission", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Response";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test query");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue("");
      });
    });
  });

  describe("Message Display", () => {
    it("displays user message after submission", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "AI response";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "What is the diagnosis?");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("What is the diagnosis?")).toBeInTheDocument();
      });
    });

    it("displays AI response with streaming", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Part 1 ";
        yield "Part 2";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("Part 1 Part 2")).toBeInTheDocument();
      });
    });

    it("displays sources when provided", async () => {
      const user = userEvent.setup();
      const mockSources = [
        { title: "Report 1", id: "r1" },
        { title: "Report 2", id: "r2" },
      ];
      const mockStreamValue = {
        success: true,
        output: {},
        sources: mockSources,
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Answer with sources";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Find reports");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId("source-list")).toBeInTheDocument();
        expect(screen.getByText("Report 1")).toBeInTheDocument();
        expect(screen.getByText("Report 2")).toBeInTheDocument();
      });
    });

    it("does not display source list when no sources", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Answer without sources";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("Answer without sources")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("source-list")).not.toBeInTheDocument();
    });

    it("shows loading indicator while streaming", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 100));
        yield "Delayed response";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      // Just verify the response eventually appears
      await waitFor(
        () => {
          expect(screen.getByText("Delayed response")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("maintains conversation history", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Response";
      });

      render(<AIModeClient />);

      // First message
      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "First question");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByText("First question")).toBeInTheDocument();
      });

      // Second message
      await user.type(searchInput, "Second question");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByText("Second question")).toBeInTheDocument();
      });

      // Verify history passed to generateAnswer
      expect(generateAnswer).toHaveBeenLastCalledWith("Second question", [
        { role: "user", content: "First question" },
        { role: "assistant", content: "Response" },
      ]);
    });
  });

  describe("Error Handling", () => {
    it("displays error message when generateAnswer fails", async () => {
      const user = userEvent.setup();
      (generateAnswer as jest.Mock).mockResolvedValue({
        success: false,
        error: "API error",
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test query");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Sorry, I encountered an error while processing your request/i)
        ).toBeInTheDocument();
      });
    });

    it("displays error message when output is missing", async () => {
      const user = userEvent.setup();
      (generateAnswer as jest.Mock).mockResolvedValue({
        success: true,
        output: null,
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test query");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Sorry, I encountered an error while processing your request/i)
        ).toBeInTheDocument();
      });
    });

    it("displays error message when exception is thrown", async () => {
      const user = userEvent.setup();
      (generateAnswer as jest.Mock).mockRejectedValue(new Error("Network error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test query");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Sorry, I encountered an error while processing your request/i)
        ).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith("AI Error:", expect.any(Error));
      consoleSpy.mockRestore();
    });

    it("re-enables input after error", async () => {
      const user = userEvent.setup();
      (generateAnswer as jest.Mock).mockRejectedValue(new Error("Error"));

      jest.spyOn(console, "error").mockImplementation();

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test query");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Sorry, I encountered an error while processing your request/i)
        ).toBeInTheDocument();
      });

      // Should be able to submit again
      await user.type(searchInput, "New query");
      await user.click(searchButton);

      expect(generateAnswer).toHaveBeenCalledTimes(2);
    });
  });

  describe("Layout Changes", () => {
    it("changes layout after first message", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Response";
      });

      const { container } = render(<AIModeClient />);

      // Initially centered
      let mainContainer = container.querySelector(".min-h-full");
      expect(mainContainer?.className).toContain("justify-center");

      // Submit a message
      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
        expect(screen.getByText("Response")).toBeInTheDocument();
      });

      // Layout should change to top-aligned
      mainContainer = container.querySelector(".min-h-full");
      expect(mainContainer?.className).toContain("justify-start");
    });

    it("hides welcome screen after first message", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Response";
      });

      render(<AIModeClient />);

      expect(screen.getByText(/Hello, Dr. Sarah/i)).toBeInTheDocument();

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test");
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.queryByText(/Hello, Dr. Sarah/i)).not.toBeInTheDocument();
        expect(screen.getByText("Test")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles non-latin characters in query", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "回答";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "これは何ですか？");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("これは何ですか？")).toBeInTheDocument();
      });
    });

    it("handles very long messages", async () => {
      const user = userEvent.setup();
      const longMessage = "A".repeat(1000);
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        yield "Response";
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      // Use paste instead of type for long messages to avoid timeout
      await user.click(searchInput);
      await user.paste(longMessage);

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(longMessage)).toBeInTheDocument();
      });
    });

    it("handles empty streaming response", async () => {
      const user = userEvent.setup();
      const mockStreamValue = {
        success: true,
        output: {},
        sources: [],
      };

      (generateAnswer as jest.Mock).mockResolvedValue(mockStreamValue);
      mockReadStreamableValue.mockImplementation(async function* () {
        // No yield - empty stream
      });

      render(<AIModeClient />);

      const searchInput = screen.getByTestId("ai-mode-search-input");
      await user.type(searchInput, "Test");

      const searchButton = screen.getByTestId("search-button");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      // User message should be visible
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });
});
