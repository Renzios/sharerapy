import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock editor instance
const mockEditor = {
  document: [{ type: "paragraph", content: "test" }],
  tryParseMarkdownToBlocks: jest.fn(),
  replaceBlocks: jest.fn(),
};

// Mock BlockNote core
jest.mock("@blocknote/core", () => ({
  BlockNoteSchema: {
    create: jest.fn(() => ({ custom: "schema" })),
  },
  defaultBlockSpecs: {
    paragraph: { type: "paragraph" },
    heading: { type: "heading" },
    table: { type: "table" },
    bulletListItem: { type: "bulletListItem" },
    numberedListItem: { type: "numberedListItem" },
    checkListItem: { type: "checkListItem" },
    divider: { type: "divider" },
  },
  defaultInlineContentSpecs: {},
  defaultStyleSpecs: {},
}));

// Mock BlockNote hooks and components
import * as BlockNoteReact from "@blocknote/react";
jest.mock("@blocknote/react", () => ({
  useCreateBlockNote: jest.fn(() => mockEditor),
}));

jest.mock("@blocknote/mantine", () => ({
  BlockNoteView: function MockBlockNoteView(props: {
    editor: unknown;
    onChange: () => void;
    theme: string;
    className: string;
  }) {
    return (
      <div
        data-testid="blocknote-view"
        data-theme={props.theme}
        className={props.className}
      >
        <div data-testid="editor-content">Editor Content</div>
        <button onClick={props.onChange} data-testid="trigger-change">
          Trigger Change
        </button>
      </div>
    );
  },
}));

// Mock CSS imports
jest.mock("@blocknote/core/fonts/inter.css", () => ({}));
jest.mock("@blocknote/mantine/style.css", () => ({}));

import Editor, { EditorRef } from "../../../components/blocknote/Editor";

describe("Editor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEditor.document = [{ type: "paragraph", content: "test" }];
    mockEditor.tryParseMarkdownToBlocks.mockResolvedValue([
      { type: "paragraph", content: "parsed markdown" },
    ]);
  });

  describe("Rendering", () => {
    it("renders BlockNoteView component", () => {
      render(<Editor />);
      expect(screen.getByTestId("blocknote-view")).toBeInTheDocument();
    });

    it("displays editor content", () => {
      render(<Editor />);
      expect(screen.getByTestId("editor-content")).toBeInTheDocument();
      expect(screen.getByText("Editor Content")).toBeInTheDocument();
    });

    it("applies light theme to BlockNoteView", () => {
      render(<Editor />);
      expect(screen.getByTestId("blocknote-view")).toHaveAttribute(
        "data-theme",
        "light"
      );
    });

    it("applies correct CSS classes to BlockNoteView", () => {
      render(<Editor />);
      const view = screen.getByTestId("blocknote-view");
      expect(view).toHaveClass("h-96");
      expect(view).toHaveClass("w-full");
      expect(view).toHaveClass("overflow-y-auto");
      expect(view).toHaveClass("bg-white");
      expect(view).toHaveClass("border");
      expect(view).toHaveClass("border-bordergray");
      expect(view).toHaveClass("rounded-lg");
      expect(view).toHaveClass("pt-3");
      expect(view).toHaveClass("font-Noto-Sans");
    });
  });

  describe("Props Handling", () => {
    it("initializes with undefined content when no value prop provided", () => {
      const { useCreateBlockNote } = BlockNoteReact;
      render(<Editor />);
      expect(useCreateBlockNote).toHaveBeenCalledWith({
        schema: { custom: "schema" },
        slashMenuItems: [],
        initialContent: undefined,
      });
    });

    it("parses and uses value prop as initial content", () => {
      const { useCreateBlockNote } = BlockNoteReact;
      const jsonValue = JSON.stringify([
        { type: "paragraph", content: "Initial text" },
      ]);
      render(<Editor value={jsonValue} />);
      expect(useCreateBlockNote).toHaveBeenCalledWith({
        schema: { custom: "schema" },
        slashMenuItems: [],
        initialContent: [{ type: "paragraph", content: "Initial text" }],
      });
    });

    it("handles invalid JSON in value prop gracefully", () => {
      const { useCreateBlockNote } = BlockNoteReact;
      render(<Editor value="invalid json {{{" />);
      expect(useCreateBlockNote).toHaveBeenCalledWith({
        schema: { custom: "schema" },
        slashMenuItems: [],
        initialContent: undefined,
      });
    });

    it("handles empty string value prop", () => {
      const { useCreateBlockNote } = BlockNoteReact;
      render(<Editor value="" />);
      expect(useCreateBlockNote).toHaveBeenCalledWith({
        schema: { custom: "schema" },
        slashMenuItems: [],
        initialContent: undefined,
      });
    });

    it("resets editor content when value becomes empty string", async () => {
      const { rerender } = render(
        <Editor value={JSON.stringify([{ type: "heading", content: "Title" }])} />
      );

      await act(async () => {
        rerender(<Editor value="" />);
      });

      await waitFor(() => {
        expect(mockEditor.replaceBlocks).toHaveBeenCalledWith(
          mockEditor.document,
          [{ type: "paragraph", content: "" }]
        );
      });
    });

    it("does not reset editor when value is not empty string", async () => {
      const { rerender } = render(<Editor value="initial" />);

      await act(async () => {
        rerender(<Editor value="updated" />);
      });

      expect(mockEditor.replaceBlocks).not.toHaveBeenCalled();
    });
  });

  describe("User Interaction", () => {
    it("calls onChange with stringified editor document when content changes", () => {
      const handleChange = jest.fn();
      render(<Editor onChange={handleChange} />);

      const triggerButton = screen.getByTestId("trigger-change");
      act(() => {
        triggerButton.click();
      });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        JSON.stringify(mockEditor.document)
      );
    });

    it("does not throw error when onChange is not provided", () => {
      render(<Editor />);

      const triggerButton = screen.getByTestId("trigger-change");
      expect(() => {
        act(() => {
          triggerButton.click();
        });
      }).not.toThrow();
    });

    it("calls onChange multiple times for multiple changes", () => {
      const handleChange = jest.fn();
      render(<Editor onChange={handleChange} />);

      const triggerButton = screen.getByTestId("trigger-change");
      act(() => {
        triggerButton.click();
        triggerButton.click();
        triggerButton.click();
      });

      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it("imports markdown via ref method", async () => {
      const ref = React.createRef<EditorRef>();
      render(<Editor ref={ref} />);

      const markdown = "# Heading\n\nParagraph text";

      await act(async () => {
        await ref.current?.importMarkdown(markdown);
      });

      expect(mockEditor.tryParseMarkdownToBlocks).toHaveBeenCalledWith(markdown);
      expect(mockEditor.replaceBlocks).toHaveBeenCalledWith(
        mockEditor.document,
        [{ type: "paragraph", content: "parsed markdown" }]
      );
    });

    it("handles markdown import with complex formatting", async () => {
      const ref = React.createRef<EditorRef>();
      render(<Editor ref={ref} />);

      const complexMarkdown = `
# Main Title

## Subtitle

- Bullet 1
- Bullet 2

1. Numbered 1
2. Numbered 2
`;

      mockEditor.tryParseMarkdownToBlocks.mockResolvedValue([
        { type: "heading", content: "Main Title" },
        { type: "heading", content: "Subtitle" },
        { type: "bulletListItem", content: "Bullet 1" },
        { type: "bulletListItem", content: "Bullet 2" },
        { type: "numberedListItem", content: "Numbered 1" },
        { type: "numberedListItem", content: "Numbered 2" },
      ]);

      await act(async () => {
        await ref.current?.importMarkdown(complexMarkdown);
      });

      expect(mockEditor.tryParseMarkdownToBlocks).toHaveBeenCalledWith(
        complexMarkdown
      );
      expect(mockEditor.replaceBlocks).toHaveBeenCalledWith(
        mockEditor.document,
        expect.arrayContaining([
          expect.objectContaining({ type: "heading" }),
          expect.objectContaining({ type: "bulletListItem" }),
          expect.objectContaining({ type: "numberedListItem" }),
        ])
      );
    });

    it("handles empty markdown import", async () => {
      const ref = React.createRef<EditorRef>();
      render(<Editor ref={ref} />);

      mockEditor.tryParseMarkdownToBlocks.mockResolvedValue([
        { type: "paragraph", content: "" },
      ]);

      await act(async () => {
        await ref.current?.importMarkdown("");
      });

      expect(mockEditor.tryParseMarkdownToBlocks).toHaveBeenCalledWith("");
      expect(mockEditor.replaceBlocks).toHaveBeenCalled();
    });

    it("exposes importMarkdown method via ref", () => {
      const ref = React.createRef<EditorRef>();
      render(<Editor ref={ref} />);

      expect(ref.current).toBeDefined();
      expect(ref.current?.importMarkdown).toBeDefined();
      expect(typeof ref.current?.importMarkdown).toBe("function");
    });

    it("triggers onChange after markdown import", async () => {
      const handleChange = jest.fn();
      const ref = React.createRef<EditorRef>();
      render(<Editor onChange={handleChange} ref={ref} />);

      // Clear the initial onChange call if any
      handleChange.mockClear();

      await act(async () => {
        await ref.current?.importMarkdown("# Test");
      });

      // After import, user can trigger change
      const triggerButton = screen.getByTestId("trigger-change");
      act(() => {
        triggerButton.click();
      });

      expect(handleChange).toHaveBeenCalledWith(
        JSON.stringify(mockEditor.document)
      );
    });
  });
});
