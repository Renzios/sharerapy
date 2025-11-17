import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

declare global {
  // blocks passed to the mock exporter
  var __lastExporterBlocks: unknown[] | undefined;
  // console.error spy
  var __consoleErrorSpy: jest.SpyInstance<void, [unknown?]> | undefined;
}

type TestBlock = Record<string, unknown>;

// Mock react-pdf renderer to avoid heavy PDF rendering in tests
jest.mock("@react-pdf/renderer", () => {
  type PDFChild = React.ReactNode | ((arg: { loading: boolean }) => React.ReactNode);

  return {
    PDFDownloadLink: ({ children }: { children: PDFChild }) => {
      // children can be a render function or nodes
      return (
        <button data-testid="pdf-download">
          {typeof children === "function" ? (children as (arg: { loading: boolean }) => React.ReactNode)({ loading: false }) : children}
        </button>
      );
    },
    PDFViewer: ({ children }: { children: React.ReactNode }) => {
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
    async toReactPDFDocument(blocks: unknown[], _opts: unknown) {
        // expose the blocks passed to the exporter for assertions in tests
        (globalThis as unknown as { __lastExporterBlocks?: unknown[] }).__lastExporterBlocks = blocks as unknown[];
  const hasError = Array.isArray(blocks) && blocks.some((b) => b && (b as Record<string, unknown>).errorTrigger === true);
        if (hasError) {
          throw new Error("exporter-failed");
        }
            // return a simple React element as the "document"
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
  // define matchMedia on window in a type-safe way for tests
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: (_: string, __: EventListener) => {},
      removeEventListener: (_: string, __: EventListener) => {},
    }),
  });
}

// Import the component after mocks are configured
import PDFViewer from "../../../../components/blocknote/PDFViewer";

describe("PDFViewer component", () => {
  beforeEach(() => {
    // default to desktop
    setMatchMedia(false);
    // silence noisy console.error messages produced by the component when exporter fails
    // tests assert on UI error states; we don't want the stack logged to test output
    // assign to the typed global helper
    (globalThis as unknown as { __consoleErrorSpy?: jest.SpyInstance }).__consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // restore console.error to original implementation
    const spy = (globalThis as unknown as { __consoleErrorSpy?: jest.SpyInstance }).__consoleErrorSpy;
    if (spy) {
      spy.mockRestore();
      (globalThis as unknown as { __consoleErrorSpy?: jest.SpyInstance }).__consoleErrorSpy = undefined;
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
  // pass an invalid value (non-array) for this test
  const invalidContent: Record<string, unknown> = { foo: "bar" };
  // @ts-expect-error deliberately wrong shape for test
  render(<PDFViewer content={invalidContent} />);

    // should eventually show the error UI with the specific message
    await waitFor(() => {
      expect(screen.getByText(/Unable to Load PDF Preview/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid content format/i)).toBeInTheDocument();
    });
  });

  it("shows error state when PDF exporter throws an exception", async () => {
    // Provide a block that triggers exporter error
  const blocks: TestBlock[] = [{ type: "paragraph", content: [], errorTrigger: true } as TestBlock];
  // @ts-expect-error deliberately wrong shape for test
  render(<PDFViewer content={blocks} title="ErrReport" />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to Load PDF Preview/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to generate PDF preview/i)).toBeInTheDocument();
    });
  });

  it("renders desktop viewer when pdfDocument is available and not mobile", async () => {
  const blocks: TestBlock[] = [{ type: "paragraph", content: [] } as TestBlock];
  // @ts-expect-error deliberately wrong shape for test
  render(<PDFViewer content={blocks} title="Desktop" />);

    // wait for the mock-pdf-doc to be injected into the viewer
    await waitFor(() => {
      expect(screen.getByTestId("react-pdf-viewer")).toBeInTheDocument();
      expect(screen.getByTestId("mock-pdf-doc")).toBeInTheDocument();
    });
  });

  it("sanitizes colors, inline content and nested children before exporting", async () => {
    // Create blocks with various style shapes to exercise sanitizer
    const blocks: TestBlock[] = [
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
      } as TestBlock,
    ];

    // render component and wait for exporter to be called
    // @ts-expect-error deliberately wrong shape for test
    render(<PDFViewer content={blocks} title="SanitizeTest" />);

    // wait until exporter received the (sanitized) blocks
    await waitFor(() => {
      expect((globalThis as unknown as { __lastExporterBlocks?: unknown[] }).__lastExporterBlocks).toBeDefined();
    });

    // grab the sanitized blocks that were actually passed to the exporter
    const sanitized: unknown = (globalThis as unknown as { __lastExporterBlocks?: unknown[] }).__lastExporterBlocks![0];

    // top-level paragraph props: textColor 'green' is allowed, backgroundColor rgb(...) -> removed
    const sanitizedProps = (sanitized as Record<string, unknown>).props as Record<string, unknown> | undefined;
    expect(sanitizedProps).toBeDefined();
    expect(sanitizedProps?.textColor as string).toBe("green");
    // backgroundColor should have been normalized to "default" then deleted
    expect(sanitizedProps?.backgroundColor).toBeUndefined();

    // first content item: text with invalid textColor should have styles removed for textColor
  const contentArray = (sanitized as Record<string, unknown>).content as unknown[] | undefined;
  expect(contentArray).toBeDefined();
  const firstText = contentArray![0] as Record<string, unknown>;
  expect(firstText.type).toBe("text");
  const firstTextStyles = firstText.styles as Record<string, unknown> | undefined;
    expect(firstTextStyles).toBeDefined();
    // textColor invalid -> removed
    expect(firstTextStyles?.textColor).toBeUndefined();
    // backgroundColor 'blue' is allowed and should remain
    expect(firstTextStyles?.backgroundColor as string).toBe("blue");

    // link nested content should preserve allowed 'red'
  const link = contentArray![1] as Record<string, unknown>;
    expect(link.type).toBe("link");
    expect(Array.isArray(link.content)).toBe(true);
    const linkContent0 = (link.content as unknown[])[0] as Record<string, unknown>;
    expect(linkContent0.styles && (linkContent0.styles as Record<string, unknown>).textColor).toBe("red");

    // nested child block's inline textColor 'invalidColor' should be removed
  const childrenArray = (sanitized as Record<string, unknown>).children as unknown[] | undefined;
  expect(childrenArray).toBeDefined();
  const child = childrenArray![0] as Record<string, unknown>;
  const childContent0 = (child.content as unknown[])[0] as Record<string, unknown>;
    expect((childContent0.styles as Record<string, unknown>).textColor).toBeUndefined();
  });
});
