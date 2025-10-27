import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next/image", () => {
  // Simple img shim for tests
  return function MockNextImage(props: any) {
    // next/image passes unrecognized props; filter to only valid <img> props to avoid console errors
    const { src, alt, width, height, className } = props;
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  };
});

jest.mock("next/link", () => {
  const React = require("react");
  return ({ href, children, ...rest }: any) => {
    const resolvedHref = typeof href === "string" ? href : href?.pathname || "/";
    return (
      <a href={resolvedHref} {...rest}>
        {children}
      </a>
    );
  };
});

const getPublicURLMock = jest.fn();
jest.mock("@/lib/utils/storage", () => ({
  getPublicURL: (...args: any[]) => getPublicURLMock(...args),
}));

jest.mock("@/components/general/Tag", () => {
  return function MockTag(props: any) {
    return (
      <span data-testid="tag" data-font-size={props.fontSize}>
        {props.text}
      </span>
    );
  };
});

// Mock only the function we need from date-fns for deterministic output
const formatDistanceToNowMock = jest.fn();
jest.mock("date-fns", () => {
  const actual = jest.requireActual("date-fns");
  return {
    ...actual,
    formatDistanceToNow: (...args: any[]) => formatDistanceToNowMock(...args),
  };
});

import ReportCard from "../../../components/cards/ReportCard";

describe("ReportCard - Integration", () => {
  beforeEach(() => {
    cleanup();
    jest.clearAllMocks();
    // default mocks
    getPublicURLMock.mockImplementation((_bucket: string, path: string) => `https://cdn.example.com/${path}`);
    formatDistanceToNowMock.mockReturnValue("3 days ago");
  });

  const baseReport = {
    id: "abc123",
    title: "Understanding CBT",
    description: "This report explores core concepts and applications.",
    created_at: "2024-01-15T10:00:00.000Z",
    therapist: {
      first_name: "Jane",
      last_name: "Doe",
      picture: "jane.png",
      clinic: {
        clinic: "Wellness Clinic",
        country: { country: "Canada" },
      },
    },
    type: { type: "CBT" },
    language: { language: "English" },
  };

  describe("Rendering", () => {
    it("renders key UI elements a user should see", () => {
        render(<ReportCard report={baseReport as any} />);

        // Link and href
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", `/reports/${baseReport.id}`);

        // Therapist and date
        expect(screen.getByText(`Written by ${baseReport.therapist.first_name} ${baseReport.therapist.last_name}`)).toBeInTheDocument();
        expect(screen.getByText("3 days ago")).toBeInTheDocument();

        // Title and description
        expect(screen.getByText(baseReport.title)).toBeInTheDocument();
        expect(screen.getByText(baseReport.description)).toBeInTheDocument();

        // Tags (country, language, therapy type, clinic)
        expect(screen.getAllByTestId("tag").map((el) => el.textContent)).toEqual(
        expect.arrayContaining([
            baseReport.therapist.clinic.country.country,
            baseReport.language.language,
            baseReport.type.type,
            baseReport.therapist.clinic.clinic,
        ])
        );
    // Image rendered with correct alt and src (via mocked getPublicURL)
    const img = screen.getByAltText("Therapist Profile Picture") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://cdn.example.com/jane.png");
    });
  });

  describe("User Interaction", () => {
    it("is clickable and dispatches a click event on the link", () => {
        render(<ReportCard report={baseReport as any} />);

        const link = screen.getByRole("link");
        const handleClick = jest.fn();
        link.addEventListener("click", handleClick);

        fireEvent.click(link);
        expect(handleClick).toHaveBeenCalledTimes(1);
        expect(link).toHaveAttribute("href", `/reports/${baseReport.id}`);
    });
  });

  describe("Props Handling", () => {
    it("passes correct props to helpers/components and handles empty picture", () => {
        const reportWithNoPicture = {
        ...baseReport,
        therapist: { ...baseReport.therapist, picture: "" },
        language: { language: "Spanish" },
        type: { type: "ACT" },
        therapist_clinic_override: undefined,
        therapistOverride: undefined,
        therapistNoPicture: undefined,
        // clinic and country stay same
        };

        render(<ReportCard report={reportWithNoPicture as any} />);

        // getPublicURL called with bucket and provided (empty) path
        expect(getPublicURLMock).toHaveBeenCalledWith("therapist_pictures", "");

        // Tags reflect incoming props
        const tags = screen.getAllByTestId("tag").map((el) => el.textContent);
        expect(tags).toEqual(expect.arrayContaining(["Canada", "Spanish", "ACT", "Wellness Clinic"]));
    });

    it("calls date-fns formatter with the report created_at date", () => {
        render(<ReportCard report={baseReport as any} />);
        // Ensure formatDistanceToNow was called with a Date derived from created_at
        expect(formatDistanceToNowMock).toHaveBeenCalledTimes(1);
        const [dateArg, optionsArg] = formatDistanceToNowMock.mock.calls[0];
        expect(dateArg instanceof Date).toBe(true);
        expect((dateArg as Date).toISOString()).toBe(new Date(baseReport.created_at).toISOString());
        expect(optionsArg).toMatchObject({ addSuffix: true });
    });
  });
});