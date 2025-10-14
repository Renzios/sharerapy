"use client"; // marks this as a React client component

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

// 1️⃣ Choose only the blocks you want
const customBlockSpecs = {
  paragraph: defaultBlockSpecs.paragraph,
  heading: defaultBlockSpecs.heading,
  table: defaultBlockSpecs.table,
  bulletListItem: defaultBlockSpecs.bulletListItem,
  numberedListItem: defaultBlockSpecs.numberedListItem,
  checklist: defaultBlockSpecs.checkListItem,
  divider: defaultBlockSpecs.divider,
};

// 2️⃣ Create your custom schema
const customSchema = BlockNoteSchema.create({
  blockSpecs: customBlockSpecs,
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: defaultStyleSpecs,
});

// 3️⃣ Editor component
export default function Editor() {
  const editor = useCreateBlockNote({
    schema: customSchema,
    slashMenuItems: [],
  });

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      className="h-96 w-full overflow-y-auto bg-white border border-bordergray rounded-lg pt-3 font-Noto-Sans
                 [&_.bn-editor]:min-h-full [&_.bn-editor]:h-auto
                 [&_.bn-editor-content]:min-h-full [&_.bn-editor-content]:h-auto
                 [&_.bn-editor-scrollable]:pt-4"
    />
  );
}
