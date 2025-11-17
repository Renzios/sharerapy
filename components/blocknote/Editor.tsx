"use client";

import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEffect, useImperativeHandle, forwardRef } from "react";

const customBlockSpecs = {
  paragraph: defaultBlockSpecs.paragraph,
  heading: defaultBlockSpecs.heading,
  table: defaultBlockSpecs.table,
  bulletListItem: defaultBlockSpecs.bulletListItem,
  numberedListItem: defaultBlockSpecs.numberedListItem,
  checklist: defaultBlockSpecs.checkListItem,
  divider: defaultBlockSpecs.divider,
};

const customSchema = BlockNoteSchema.create({
  blockSpecs: customBlockSpecs,
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: defaultStyleSpecs,
});

export interface EditorRef {
  importMarkdown: (markdown: string) => Promise<void>;
}

interface EditorProps {
  onChange?: (content: string) => void;
  value?: string; // Add value prop to control the editor content
}

/**
 * The Editor component is a rich text editor using BlockNote (external library)
 * It only consists of specific blocks as defined in customBlockSpecs.
 *
 * @param props - The editor props
 */
const Editor = forwardRef<EditorRef, EditorProps>(
  ({ onChange, value }, ref) => {
    // Parse initial content if provided
    const initialContent = value
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return undefined;
          }
        })()
      : undefined;

    const editor = useCreateBlockNote({
      schema: customSchema,
      slashMenuItems: [],
      initialContent,
    });

    // Expose importMarkdown method via ref
    useImperativeHandle(ref, () => ({
      importMarkdown: async (markdown: string) => {
        const blocks = await editor.tryParseMarkdownToBlocks(markdown);
        editor.replaceBlocks(editor.document, blocks);
      },
    }));

    // Reset editor content when value becomes empty
    useEffect(() => {
      if (value === "" && editor) {
        // Replace editor content with a single empty paragraph
        editor.replaceBlocks(editor.document, [
          {
            type: "paragraph",
            content: "",
          },
        ]);
      }
    }, [value, editor]);

    const handleChange = () => {
      const content = JSON.stringify(editor.document);
      onChange?.(content);
    };

    return (
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light"
        className="h-96 w-full overflow-y-auto bg-white border border-bordergray rounded-lg pt-3 font-Noto-Sans
                 [&_.bn-editor]:min-h-full [&_.bn-editor]:h-auto
                 [&_.bn-editor-content]:min-h-full [&_.bn-editor-content]:h-auto
                 [&_.bn-editor-scrollable]:pt-4"
      />
    );
  }
);

Editor.displayName = "Editor";

export default Editor;
