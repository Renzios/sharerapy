import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SourceList, Source } from "@/components/cards/SourceCard";

// Mock next/link to render a plain anchor so we can assert href and click behavior
jest.mock("next/link", () => {
  return function Link({
    href,
    children,
    className,
    target,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    target?: string;
  }) {
    return (
      <a href={href} className={className} target={target}>
        {children}
      </a>
    );
  };
});

const makeSource = (overrides?: Partial<Source>): Source => ({
  id: "source-1",
  report_id: "report-1",
  text: "This is a sample source text from a report.",
  similarity: 0.85,
  report: {
    id: "report-1",
    title: "Understanding Cognitive Behavioral Therapy",
    description: "A comprehensive guide to CBT techniques.",
    created_at: "2024-01-15T10:00:00.000Z",
    updated_at: "2024-01-15T10:00:00.000Z",
    therapist_id: "therapist-1",
    type_id: 1,
    language_id: 1,
    patient_id: "patient-1",
    content: "",
    therapist: {
      id: "therapist-1",
      name: "Dr. Jane Smith",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
      picture: "jane.png",
      clinic_id: 1,
      clinic: {
        id: 1,
        clinic: "Wellness Clinic",
        country_id: 1,
        country: {
          id: 1,
          country: "United States",
        },
      },
    },
    type: {
      id: 1,
      type: "CBT",
    },
    language: {
      id: 1,
      language: "English",
    },
    patient: {
      id: "patient-1",
      name: "John Doe",
      contact_number: "123-456-7890",
      sex: "Male",
      country_id: 1,
      country: {
        id: 1,
        country: "United States",
      },
      age: "25",
    },
  },
  ...overrides,
});

describe("SourceList", () => {
  describe("Rendering", () => {
    it("renders nothing when sources array is empty", () => {
      const { container } = render(<SourceList sources={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders nothing when sources is undefined", () => {
      const { container } = render(<SourceList sources={undefined as unknown as Source[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders section header and single source", () => {
      const sources = [makeSource()];
      render(<SourceList sources={sources} />);

      expect(screen.getByText("Sources Used")).toBeInTheDocument();
      expect(screen.getByText("Understanding Cognitive Behavioral Therapy")).toBeInTheDocument();
      expect(screen.getByText("By: Dr. Jane Smith")).toBeInTheDocument();
    });

    it("renders multiple sources", () => {
      const sources = [
        makeSource({
          id: "source-1",
          report_id: "report-1",
          report: {
            ...makeSource().report!,
            id: "report-1",
            title: "CBT Techniques",
            therapist: {
              ...makeSource().report!.therapist,
              name: "Dr. Alice Brown",
            },
          },
        }),
        makeSource({
          id: "source-2",
          report_id: "report-2",
          report: {
            ...makeSource().report!,
            id: "report-2",
            title: "Mindfulness Practices",
            therapist: {
              ...makeSource().report!.therapist,
              name: "Dr. Bob Wilson",
            },
          },
        }),
      ];
      render(<SourceList sources={sources} />);

      expect(screen.getByText("CBT Techniques")).toBeInTheDocument();
      expect(screen.getByText("By: Dr. Alice Brown")).toBeInTheDocument();
      expect(screen.getByText("Mindfulness Practices")).toBeInTheDocument();
      expect(screen.getByText("By: Dr. Bob Wilson")).toBeInTheDocument();
    });

    it("deduplicates sources with same report_id", () => {
      const sources = [
        makeSource({
          id: "source-1",
          report_id: "report-1",
        }),
        makeSource({
          id: "source-2",
          report_id: "report-1", // Same report_id
        }),
        makeSource({
          id: "source-3",
          report_id: "report-2",
          report: {
            ...makeSource().report!,
            id: "report-2",
            title: "Different Report",
          },
        }),
      ];
      render(<SourceList sources={sources} />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2); // Only 2 unique report_ids
      expect(screen.getByText("Understanding Cognitive Behavioral Therapy")).toBeInTheDocument();
      expect(screen.getByText("Different Report")).toBeInTheDocument();
    });

    it('shows "Unknown Therapist" when therapist name is missing', () => {
      const source = makeSource({
        report: {
          ...makeSource().report!,
          therapist: {
            ...makeSource().report!.therapist,
            name: null as unknown as string,
          },
        },
      });
      render(<SourceList sources={[source]} />);

      expect(screen.getByText("By: Unknown Therapist")).toBeInTheDocument();
    });

    it('shows "Unknown Therapist" when therapist name is empty string', () => {
      const source = makeSource({
        report: {
          ...makeSource().report!,
          therapist: {
            ...makeSource().report!.therapist,
            name: "",
          },
        },
      });
      render(<SourceList sources={[source]} />);

      expect(screen.getByText("By: Unknown Therapist")).toBeInTheDocument();
    });

    it("skips rendering sources with null report", () => {
      const sources = [
        makeSource({
          id: "source-1",
          report: null,
        }),
        makeSource({
          id: "source-2",
          report_id: "report-2",
        }),
      ];
      render(<SourceList sources={sources} />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(1); // Only the source with valid report
      expect(screen.getByText("Understanding Cognitive Behavioral Therapy")).toBeInTheDocument();
    });

    it("supports non-latin characters in title and therapist name", () => {
      const sources = [
        makeSource({
          report: {
            ...makeSource().report!,
            title: "認知行動療法の理解",
            therapist: {
              ...makeSource().report!.therapist,
              name: "山田太郎博士",
            },
          },
        }),
      ];
      render(<SourceList sources={sources} />);

      expect(screen.getByText("認知行動療法の理解")).toBeInTheDocument();
      expect(screen.getByText("By: 山田太郎博士")).toBeInTheDocument();
    });

    it("truncates long titles with line-clamp-2 class", () => {
      const longTitle = "A".repeat(200);
      const source = makeSource({
        report: {
          ...makeSource().report!,
          title: longTitle,
        },
      });
      const { container } = render(<SourceList sources={[source]} />);

      const titleElement = container.querySelector(".line-clamp-2");
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent(longTitle);
    });

    it("applies expected container and card styling classes", () => {
      const { container } = render(<SourceList sources={[makeSource()]} />);

      const mainContainer = container.querySelector(".mt-3.w-full");
      expect(mainContainer).toBeInTheDocument();

      const cardContainer = container.querySelector(".flex.w-full.gap-3.overflow-x-auto");
      expect(cardContainer).toBeInTheDocument();

      const card = container.querySelector(".shrink-0");
      expect(card).toBeInTheDocument();
      expect(card?.className).toContain("border");
      expect(card?.className).toContain("hover:bg-bordergray/30");
      expect(card?.className).toContain("hover:cursor-pointer");
    });
  });

  describe("User Interaction", () => {
    it("renders links that point to the correct report URLs", () => {
      const sources = [
        makeSource({
          id: "source-1",
          report_id: "report-123",
          report: {
            ...makeSource().report!,
            id: "report-123",
            title: "Report One",
          },
        }),
        makeSource({
          id: "source-2",
          report_id: "report-456",
          report: {
            ...makeSource().report!,
            id: "report-456",
            title: "Report Two",
          },
        }),
      ];
      render(<SourceList sources={sources} />);

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveAttribute("href", "/reports/report-123");
      expect(links[0]).toHaveAttribute("target", "_blank");
      expect(links[1]).toHaveAttribute("href", "/reports/report-456");
      expect(links[1]).toHaveAttribute("target", "_blank");
    });

    it("is focusable and clickable", async () => {
      render(<SourceList sources={[makeSource()]} />);
      const user = userEvent.setup();

      const link = screen.getByRole("link");

      await user.tab();
      expect(document.activeElement).toBe(link);

      // Clicking shouldn't throw
      await user.click(link);
      expect(link).toBeInTheDocument();
    });

    it("supports hover without changing content", async () => {
      const source = makeSource();
      render(<SourceList sources={[source]} />);
      const user = userEvent.setup();

      const link = screen.getByRole("link");
      await user.hover(link);

      expect(screen.getByText("Understanding Cognitive Behavioral Therapy")).toBeInTheDocument();
      expect(screen.getByText("By: Dr. Jane Smith")).toBeInTheDocument();
    });

    it("opens link in new tab via target=_blank", () => {
      render(<SourceList sources={[makeSource()]} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Props Handling", () => {
    it("uses report.id to construct href", () => {
      const source = makeSource({
        report: {
          ...makeSource().report!,
          id: "custom-report-id-789",
        },
      });
      render(<SourceList sources={[source]} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/reports/custom-report-id-789");
    });

    it("handles sources with minimal valid data", () => {
      const minimalSource = makeSource({
        report: {
          ...makeSource().report!,
          title: "Minimal Report",
          therapist: {
            ...makeSource().report!.therapist,
            name: "Dr. Min",
          },
        },
      });
      render(<SourceList sources={[minimalSource]} />);

      expect(screen.getByText("Minimal Report")).toBeInTheDocument();
      expect(screen.getByText("By: Dr. Min")).toBeInTheDocument();
    });

    it("preserves order of unique sources", () => {
      const sources = [
        makeSource({
          id: "source-1",
          report_id: "report-1",
          report: {
            ...makeSource().report!,
            id: "report-1",
            title: "First Report",
          },
        }),
        makeSource({
          id: "source-2",
          report_id: "report-2",
          report: {
            ...makeSource().report!,
            id: "report-2",
            title: "Second Report",
          },
        }),
        makeSource({
          id: "source-3",
          report_id: "report-3",
          report: {
            ...makeSource().report!,
            id: "report-3",
            title: "Third Report",
          },
        }),
      ];
      render(<SourceList sources={sources} />);

      const titles = screen.getAllByRole("heading", { level: 1 });
      expect(titles[0]).toHaveTextContent("First Report");
      expect(titles[1]).toHaveTextContent("Second Report");
      expect(titles[2]).toHaveTextContent("Third Report");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty therapist object gracefully", () => {
      const source = makeSource({
        report: {
          ...makeSource().report!,
          therapist: {} as any,
        },
      });
      render(<SourceList sources={[source]} />);

      expect(screen.getByText("By: Unknown Therapist")).toBeInTheDocument();
    });

    it("handles very long therapist names", () => {
      const longName = "Dr. " + "A".repeat(200);
      const source = makeSource({
        report: {
          ...makeSource().report!,
          therapist: {
            ...makeSource().report!.therapist,
            name: longName,
          },
        },
      });
      render(<SourceList sources={[source]} />);

      expect(screen.getByText(`By: ${longName}`)).toBeInTheDocument();
    });

    it("handles special characters in title", () => {
      const specialTitle = "Report: <script>alert('xss')</script> & \"quotes\"";
      const source = makeSource({
        report: {
          ...makeSource().report!,
          title: specialTitle,
        },
      });
      render(<SourceList sources={[source]} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it("renders correctly with single source", () => {
      render(<SourceList sources={[makeSource()]} />);

      expect(screen.getByText("Sources Used")).toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("renders correctly with many sources", () => {
      const sources = Array.from({ length: 10 }, (_, i) =>
        makeSource({
          id: `source-${i}`,
          report_id: `report-${i}`,
          report: {
            ...makeSource().report!,
            id: `report-${i}`,
            title: `Report ${i}`,
          },
        })
      );
      render(<SourceList sources={sources} />);

      expect(screen.getAllByRole("link")).toHaveLength(10);
    });
  });
});
