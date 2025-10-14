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
import { useEffect } from "react";

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

interface EditorProps {
  onChange?: (content: string) => void;
  value?: string; // Add value prop to control the editor content
}

export default function Editor({ onChange, value }: EditorProps) {
  const editor = useCreateBlockNote({
    schema: customSchema,
    slashMenuItems: [],
  });

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
