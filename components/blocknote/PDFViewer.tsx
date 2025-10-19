/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
// 1. IMPORT PDFDownloadLink
import {
  PDFDownloadLink,
  PDFViewer as ReactPDFViewer,
} from "@react-pdf/renderer";

import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import type { Block } from "@blocknote/core";
import type { Json } from "@/lib/types/database.types";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";

// Styles for PDF header and footer
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#14499E",
  },
  reportTitle: {
    fontSize: 14,
    color: "#1E1E1E",
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#6B7280",
    fontFamily: "Helvetica",
  },
});

/**
 * Sanitizes BlockNote content by converting RGB colors to standard values.
 * Prevents PDF generation errors from pasted content with custom colors.
 * The PDF exporter only supports named colors like "red", "blue", etc.,
 * but pasted content may contain RGB values like "rgb(0, 29, 53)".
 */
function sanitizeContentForPDF(blocks: Block[]): any[] {
  // Convert RGB colors (e.g., "rgb(0, 29, 53)") to "default" (black)
  // PDF exporter doesn't support custom RGB values
  const normalizeColor = (color: string | undefined): string => {
    if (!color || color === "default") return "default";
    if (color.startsWith("rgb(")) return "default";
    return color; // Keep standard color names like "red", "blue", etc.
  };

  // Remove RGB colors from text/background color styles
  const sanitizeStyles = (styles: any): any => {
    if (!styles || typeof styles !== "object") return styles;

    const sanitizedStyles: any = { ...styles };

    if (sanitizedStyles.textColor) {
      sanitizedStyles.textColor = normalizeColor(sanitizedStyles.textColor);
      // Remove default colors to reduce clutter in PDF JSON
      if (sanitizedStyles.textColor === "default") {
        delete sanitizedStyles.textColor;
      }
    }

    if (sanitizedStyles.backgroundColor) {
      sanitizedStyles.backgroundColor = normalizeColor(
        sanitizedStyles.backgroundColor
      );
      if (sanitizedStyles.backgroundColor === "default") {
        delete sanitizedStyles.backgroundColor;
      }
    }

    return sanitizedStyles;
  };

  // Process inline content (text, links) and sanitize their styles
  const sanitizeInlineContent = (content: any[]): any[] => {
    return content.map((item: any) => {
      // Handle plain text with styles
      if (item.type === "text" && item.styles) {
        return {
          ...item,
          styles: sanitizeStyles(item.styles),
        };
      }

      // Recursively sanitize link content since links contain text nodes
      // that may also have custom colors
      if (item.type === "link" && item.content && Array.isArray(item.content)) {
        return {
          ...item,
          content: sanitizeInlineContent(item.content),
        };
      }

      return item;
    });
  };

  // Process each block and its content/children
  return blocks.map((block: any) => {
    // Handle blocks with inline content (paragraphs, headings)
    if (block.content && Array.isArray(block.content)) {
      return {
        ...block,
        content: sanitizeInlineContent(block.content),
      };
    }

    // Recursively process nested blocks (lists, nested structures)
    if (block.children && Array.isArray(block.children)) {
      return {
        ...block,
        children: sanitizeContentForPDF(block.children),
      };
    }

    return block;
  });
}

// 2. CREATE A SIMPLE useMediaQuery HOOK
// This hook safely checks the screen size on the client
// It defaults to `false` (desktop) to prevent hydration mismatches
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false); // Default to desktop

  useEffect(() => {
    // This code only runs on the client, after hydration
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

interface PDFViewerProps {
  content: Json;
  title?: string;
  therapistName?: string;
}

/**
 * PDF Viewer component that converts BlockNote JSON content to a PDF preview.
 * Uses @blocknote/xl-pdf-exporter to convert blocks and @react-pdf/renderer to display.
 * Handles loading, error, and empty states with card-style designs.
 *
 * @param props - The PDF viewer props
 */
export default function PDFViewer({
  content,
  title,
  therapistName,
}: PDFViewerProps) {
  const [pdfDocument, setPdfDocument] = useState<React.ReactElement | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. USE THE HOOK
  // We check for `max-width: 768px` (Tailwind's `md` breakpoint)
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    async function generatePDF() {
      try {
        setIsLoading(true);
        setError(null);

        // Content must be an array of BlockNote blocks (JSON format from database)
        if (!content || !Array.isArray(content)) {
          setError("Invalid content format");
          setIsLoading(false);
          return;
        }

        const blocks = content as Block[];

        // Sanitize content to remove RGB colors that the PDF exporter can't handle
        // This is necessary when users paste content from external sources
        const sanitizedBlocks = sanitizeContentForPDF(blocks);

        // Create BlockNote schema with default block types (paragraph, heading, table, etc.)
        const schema = BlockNoteSchema.create({
          blockSpecs: defaultBlockSpecs,
        });

        const exporter = new PDFExporter(schema, pdfDefaultSchemaMappings);

        // Build PDF header with ShareRapy branding and report title
        const header = (
          <View style={styles.header}>
            <Image src="/logowordmark.png" style={{ width: 220, height: 45 }} />
            <Text style={styles.reportTitle}>{title || "Therapy Report"}</Text>
          </View>
        );

        // Build PDF footer with therapist attribution (optional)
        const footer = therapistName ? (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Written by {therapistName}</Text>
          </View>
        ) : undefined;

        // Convert BlockNote JSON to React PDF document
        const document = await exporter.toReactPDFDocument(sanitizedBlocks, {
          header: header,
          footer: footer,
        });

        setPdfDocument(document);
      } catch (err) {
        console.error("Error generating PDF:", err);
        setError("Failed to generate PDF preview");
      } finally {
        setIsLoading(false);
      }
    }

    if (content) {
      generatePDF();
    }
  }, [content, title, therapistName]);

  return (
    <>
      {/* Loading state: show spinner while PDF is being generated */}
      {isLoading && (
        <div className="flex items-center justify-center h-96 bg-white rounded-lg border-bordergray">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-darkgray font-Noto-Sans">
              Generating PDF preview...
            </p>
          </div>
        </div>
      )}

      {/* Error state: display friendly error message with details */}
      {error && !isLoading && (
        <div
          className="
            flex flex-col gap-y-4
            bg-white rounded-[0.5rem] p-6
            border border-bordergray
            transition-transform duration-200 ease-in-out
          "
        >
          <div className="flex flex-col gap-y-2">
            <h2 className="font-Noto-Sans font-semibold text-lg text-black">
              Unable to Load PDF Preview
            </h2>
            <p className="font-Noto-Sans text-sm text-darkgray">
              There was an error generating the PDF preview. Please try
              refreshing the page or contact support if the issue persists.
            </p>
          </div>
          <div className="flex flex-col gap-y-1">
            <h3 className="font-Noto-Sans font-medium text-sm text-darkgray">
              Error Details
            </h3>
            <p className="font-mono text-sm text-black bg-bordergray/30 p-2 rounded">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Empty state: shown when report has no content blocks */}
      {!pdfDocument && !isLoading && !error && (
        <div
          className="
            flex flex-col gap-y-4 items-center justify-center
            bg-white rounded-[0.5rem] p-12
            border border-bordergray
            transition-transform duration-200 ease-in-out
            min-h-[400px]
          "
        >
          <div className="flex flex-col gap-y-2 text-center">
            <h2 className="font-Noto-Sans font-semibold text-lg text-black">
              No Content Available
            </h2>
            <p className="font-Noto-Sans text-sm text-darkgray">
              This report doesn&apos;t have any content to display yet.
            </p>
          </div>
        </div>
      )}

      {/* 4. MODIFY THE SUCCESS STATE (This is the key change) */}
      {pdfDocument && !isLoading && !error && (
        <>
          {isMobile ? (
            // --- ON MOBILE: Show a download button ---
            <div
              className="
                flex flex-col items-center justify-center 
                bg-white rounded-[0.5rem] p-12 
                border border-bordergray
                min-h-[350px]
              "
            >
              <div className="flex flex-col gap-y-2 text-center mb-6">
                <h2 className="font-Noto-Sans font-semibold text-lg text-black">
                  Report is Ready
                </h2>
                <p className="font-Noto-Sans text-sm text-darkgray">
                  Please download the report to view.
                </p>
              </div>
              <PDFDownloadLink
                document={pdfDocument as any}
                fileName={`${title || "therapy-report"}.pdf`}
                className="
                  px-5 py-3 
                  bg-primary text-white 
                  font-Noto-Sans font-semibold 
                  rounded-lg shadow-sm 
                  hover:bg-primary/90 
                  transition-colors
                "
              >
                {({ loading }) =>
                  loading ? "Generating PDF..." : "Download Report"
                }
              </PDFDownloadLink>
            </div>
          ) : (
            // --- ON DESKTOP: Show the embedded viewer ---
            <div className="w-full h-screen bg-background rounded-lg border border-bordergray">
              <ReactPDFViewer
                width="100%"
                height="100%"
                showToolbar={true}
                className="rounded-lg"
              >
                {pdfDocument as any}
              </ReactPDFViewer>
            </div>
          )}
        </>
      )}
    </>
  );
}
