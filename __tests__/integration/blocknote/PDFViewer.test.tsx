import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock react-pdf renderer to avoid heavy PDF rendering in tests
jest.mock("@react-pdf/renderer", () => {
  const React = require("react");
  return {
    PDFDownloadLink: ({ children }: { children: unknown }) => {
      // children is a function that receives { loading }
      return (
        <button data-testid="pdf-download">
          {/* @ts-ignore allow calling unknown child as function for mock */}
          {typeof children === "function" ? (children as (arg: { loading: boolean }) => unknown)({ loading: false }) : children}
        </button>
      );
    },
    PDFViewer: ({ children }: { children: unknown }) => {
      // @ts-ignore allow rendering unknown children in mock
      return <div data-testid="react-pdf-viewer">{children}</div>;
    },
    View: "div",
    Text: "span",
    Image: "img",
    StyleSheet: { create: () => ({}) },
  };
});

// Mock blocknote exporter and core so that PDF generation is predictable and testable
jest.mock("@blocknote/xl-pdf-exporter", () => {
  return {
    pdfDefaultSchemaMappings: {},
    PDFExporter: class PDFExporter {
      // toReactPDFDocument inspects blocks and will throw if a block has errorTrigger
    async toReactPDFDocument(blocks: unknown[], opts: unknown) {
        // expose the blocks passed to the exporter for assertions in tests
        // @ts-ignore - test helper
        (global as any).__lastExporterBlocks = blocks;
  // @ts-ignore allow treating unknown array members as records for test predicate
  const hasError = Array.isArray(blocks) && blocks.some((b) => b && (b as Record<string, unknown>).errorTrigger === true);
        if (hasError) {
          throw new Error("exporter-failed");
        }
        // return a simple React element as the "document"
        const React = require("react");
        return React.createElement("div", { "data-testid": "mock-pdf-doc" }, "PDF");
      }
    },
  };
});

jest.mock("@blocknote/core", () => ({
  defaultBlockSpecs: {},
  BlockNoteSchema: {
    create: () => ({ /* dummy schema */ }),
  },
}));

// We need to mock window.matchMedia to exercise mobile and desktop branches
function setMatchMedia(matches: boolean) {
  // @ts-ignore - test helper
  window.matchMedia = (query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, __: EventListener) => {},
    removeEventListener: (_: string, __: EventListener) => {},
  });
}

// Import the component after mocks are configured
import PDFViewer from "../../../components/blocknote/PDFViewer";

describe("PDFViewer component", () => {
  beforeEach(() => {
    // default to desktop
    setMatchMedia(false);
    // silence noisy console.error messages produced by the component when exporter fails
    // tests assert on UI error states; we don't want the stack logged to test output
    // @ts-ignore allow assigning spy to a plain variable
    (global as any).__consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // restore console.error to original implementation
    // @ts-ignore
    if ((global as any).__consoleErrorSpy) {
      // @ts-ignore
      (global as any).__consoleErrorSpy.mockRestore();
      // @ts-ignore
      (global as any).__consoleErrorSpy = undefined;
    }
  });

  it("shows loading state initially and then renders viewer for empty array (mocked)", async () => {
    // empty array will be processed by our mock and produce a mock document
    render(<PDFViewer content={[]} title="Report" />);

    // loading spinner should be visible immediately
    expect(screen.getByText(/Generating PDF preview.../i)).toBeInTheDocument();

    // wait for the mock document to be injected into the viewer
    await waitFor(() => {
      expect(screen.getByTestId("react-pdf-viewer")).toBeInTheDocument();
      expect(screen.getByTestId("mock-pdf-doc")).toBeInTheDocument();
    });
  });

  it("shows error state when content format is invalid (not array)", async () => {
    // pass an invalid value and ignore TS for this test
    // @ts-ignore
    render(<PDFViewer content={{ foo: "bar" }} />);

    // should eventually show the error UI with the specific message
    await waitFor(() => {
      expect(screen.getByText(/Unable to Load PDF Preview/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid content format/i)).toBeInTheDocument();
    });
  });

  test("shows error state when PDF exporter throws an exception", async () => {
    // Provide a block that triggers exporter error
  const blocks = [{ type: "paragraph", content: [], errorTrigger: true }];
  // @ts-ignore allow passing it blocks that don't strictly match the component Json type
  render(<PDFViewer content={blocks} title="ErrReport" />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to Load PDF Preview/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to generate PDF preview/i)).toBeInTheDocument();
    });
  });

  it("renders desktop viewer when pdfDocument is available and not mobile", async () => {
  const blocks = [{ type: "paragraph", content: [] }];
  // @ts-ignore
  render(<PDFViewer content={blocks} title="Desktop" />);

    // wait for the mock-pdf-doc to be injected into the viewer
    await waitFor(() => {
      expect(screen.getByTestId("react-pdf-viewer")).toBeInTheDocument();
      expect(screen.getByTestId("mock-pdf-doc")).toBeInTheDocument();
    });
  });

  test("renders mobile download UI and allows clicking download button", async () => {
    // Simulate mobile
    setMatchMedia(true);

  const blocks = [{ type: "paragraph", content: [] }];
  // @ts-ignore
  render(<PDFViewer content={blocks} title="Mobile" />);

    // wait for Report Ready UI
    await waitFor(() => {
      expect(screen.getByText(/Report is Ready/i)).toBeInTheDocument();
    });

    const download = screen.getByTestId("pdf-download");
    expect(download).toBeInTheDocument();

    // user-event click
    await userEvent.click(download);

    // clicking should not throw and button still present
    expect(screen.getByTestId("pdf-download")).toBeInTheDocument();
  });

  it("sanitizes colors, inline content and nested children before exporting", async () => {
    // Create blocks with various style shapes to exercise sanitizer
    const blocks = [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "keep-bg", styles: { textColor: "rgb(1,2,3)", backgroundColor: "blue" } },
          {
            type: "link",
            url: "https://example.com",
            content: [{ type: "text", text: "link-red", styles: { textColor: "red" } }],
          },
        ],
        props: { textColor: "green", backgroundColor: "rgb(0,0,0)" },
        children: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "child", styles: { textColor: "invalidColor" } }],
          },
        ],
      },
    ];

    // render component and wait for exporter to be called
    // @ts-ignore
    render(<PDFViewer content={blocks} title="SanitizeTest" />);

    // wait until exporter received the (sanitized) blocks
    await waitFor(() => {
      // @ts-ignore - test helper set in mock
      expect((global as any).__lastExporterBlocks).toBeDefined();
    });

    // grab the sanitized blocks that were actually passed to the exporter
    // @ts-ignore
    const sanitized: any = (global as any).__lastExporterBlocks[0];

    // top-level paragraph props: textColor 'green' is allowed, backgroundColor rgb(...) -> removed
    expect(sanitized.props).toBeDefined();
    expect(sanitized.props.textColor).toBe("green");
    // backgroundColor should have been normalized to "default" then deleted
    expect(sanitized.props.backgroundColor).toBeUndefined();

    // first content item: text with invalid textColor should have styles removed for textColor
    const firstText = sanitized.content[0];
    expect(firstText.type).toBe("text");
    expect(firstText.styles).toBeDefined();
    // textColor invalid -> removed
    expect(firstText.styles.textColor).toBeUndefined();
    // backgroundColor 'blue' is allowed and should remain
    expect(firstText.styles.backgroundColor).toBe("blue");

    // link nested content should preserve allowed 'red'
    const link = sanitized.content[1];
    expect(link.type).toBe("link");
    expect(Array.isArray(link.content)).toBe(true);
    expect(link.content[0].styles.textColor).toBe("red");

    // nested child block's inline textColor 'invalidColor' should be removed
    const child = sanitized.children[0];
    expect(child.content[0].styles.textColor).toBeUndefined();
  });
});
