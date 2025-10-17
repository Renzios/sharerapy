"use client";

import { useEffect, useState } from "react";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import { PDFViewer as ReactPDFViewer } from "@react-pdf/renderer";
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "black",
    color: "#1E1E1E",
    fontFamily: "Helvetica-Bold",
  },
  brandTextPrimary: {
    color: "#14499E",
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

interface PDFViewerProps {
  content: Json;
  title?: string;
  therapistName?: string;
}

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
            <View style={styles.logoContainer}>
              <Image src="/logo.png" style={styles.logo} />
              <Text style={styles.brandText}>
                <Text style={styles.brandTextPrimary}>share</Text>
                rapy.
              </Text>
            </View>
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
              This report doesn't have any content to display yet.
            </p>
          </div>
        </div>
      )}

      {/* Success state: render the PDF with interactive toolbar (zoom, download, print) */}
      {pdfDocument && !isLoading && !error && (
        <div className="w-full h-[600px] md:h-screen bg-background rounded-lg border border-bordergray">
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
  );
}
