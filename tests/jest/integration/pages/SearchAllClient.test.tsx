import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Provide a push mock and mock next/navigation so Link clicks can call router.push
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock next/link to call the pushMock when clicked (no require(), typed props)
interface NextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
}
jest.mock("next/link", () => {
  const Component = (props: NextLinkProps) => {
    const { href, children, ...rest } = props;
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          if (typeof pushMock === "function") pushMock(href);
        }}
        {...rest}
      >
        {children}
      </a>
    );
  };
  Component.displayName = "NextLinkMock";
  return {
    __esModule: true,
    default: Component,
  };
});

import SearchAllClient from "@/components/client-pages/SearchAllClient";

// Minimal test-only types for mocked components (avoid using `any`)
type PatientLike = { id: string; name: string };
type ReportLike = { id: string; title: string };
type TherapistLike = { id: string; name: string };

// Mock the cards to simple anchors so we can assert text and hrefs without images
jest.mock("@/components/cards/PatientCard", () => {
  const Component = ({ patient }: { patient: PatientLike }) => (
    <a
      href={`/profile/patient/${patient.id}`}
      onClick={(e) => {
        e.preventDefault();
        if (typeof pushMock === "function") pushMock(`/profile/patient/${patient.id}`);
      }}
    >
      {patient.name}
    </a>
  );
  Component.displayName = "PatientCard";
  return Component;
});

jest.mock("@/components/cards/ReportCard", () => {
  const Component = ({ report }: { report: ReportLike }) => (
    <a
      href={`/reports/${report.id}`}
      onClick={(e) => {
        e.preventDefault();
        if (typeof pushMock === "function") pushMock(`/reports/${report.id}`);
      }}
    >
      {report.title}
    </a>
  );
  Component.displayName = "ReportCard";
  return Component;
});

jest.mock("@/components/cards/TherapistCard", () => {
  const Component = ({ therapist }: { therapist: TherapistLike }) => (
    <a
      href={`/profile/therapist/${therapist.id}`}
      onClick={(e) => {
        e.preventDefault();
        if (typeof pushMock === "function") pushMock(`/profile/therapist/${therapist.id}`);
      }}
    >
      {therapist.name}
    </a>
  );
  Component.displayName = "TherapistCard";
  return Component;
});

// Mock fetch actions used by the component so handleSearch is deterministic
const mockFetchPatients = jest.fn();
const mockFetchReports = jest.fn();
const mockFetchTherapists = jest.fn();

jest.mock("@/app/(with-sidebar)/search/patients/actions", () => ({
  fetchPatients: () => mockFetchPatients(),
}));

jest.mock("@/app/(with-sidebar)/search/reports/actions", () => ({
  fetchReports: () => mockFetchReports(),
}));

jest.mock("@/app/(with-sidebar)/search/therapists/actions", () => ({
  fetchTherapists: () => mockFetchTherapists(),
}));

describe("SearchAllClient integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const initialPatients = [
    {
      id: "pat-1",
      name: "Jane Doe",
      first_name: "Jane",
      last_name: "Doe",
      contact_number: "12345",
      country_id: 1,
        country: { country: "CountryX", id: 1 },
         sex: "Female" as const,
      birthdate: "1993-01-01",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
  reports: [{ type: { id: 1, type: "Assessment" } }],
    },
  ];

  const initialReports = [
    {
      id: "rep-1",
      title: "Report One",
      description: "desc",
      content: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      language_id: 1,
      patient_id: "pat-1",
      therapist_id: "ther-1",
      type_id: 1,
       therapist: {
         id: "ther-1",
         name: "Dr. Alice",
         first_name: "A",
         last_name: "B",
         picture: "",
         bio: "",
         age: 40,
         clinic_id: 1,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString(),
         clinic: { clinic: "C", country_id: 1, id: 1, country: { country: "CountryX", id: 1 } },
       },
      type: { id: 1, type: "Assessment" },
    language: { id: 1, code: "en", language: "English" },
      patient: {
        id: "pat-1",
        name: "Jane Doe",
        first_name: "Jane",
        last_name: "Doe",
        contact_number: "12345",
        country_id: 1,
        country: { country: "CountryX", id: 1 },
        sex: "Female" as const,
        birthdate: "1993-01-01",
        created_at: initialPatients[0].created_at,
        updated_at: initialPatients[0].updated_at,
        reports: [{ type: { id: 1, type: "Assessment" } }],
      },
    },
  ];

  const initialTherapists = [
    {
      id: "ther-1",
      name: "Dr. Alice",
      first_name: "Alice",
      last_name: "Smith",
      picture: "",
      bio: "Bio",
      age: 40,
      clinic_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
        clinic: { clinic: "Care Clinic", country_id: 1, id: 1, country: { country: "CountryX", id: 1 } },
      reports: [],
    },
  ];

  it("renders initial patients, reports and therapists and their links", () => {
    render(
      <SearchAllClient
        initialPatients={initialPatients}
        initialReports={initialReports}
        initialTherapists={initialTherapists}
      />
    );

    // Verify initial items are rendered
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Report One")).toBeInTheDocument();
    expect(screen.getByText("Dr. Alice")).toBeInTheDocument();
  });

  it("navigates to profiles and reports via Link (router.push called)", async () => {
    render(
      <SearchAllClient
        initialPatients={initialPatients}
        initialReports={initialReports}
        initialTherapists={initialTherapists}
      />
    );

    const therLink = screen.getByText("Dr. Alice").closest("a");
    await userEvent.click(therLink!);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/profile/therapist/ther-1"));

    const patLink = screen.getByText("Jane Doe").closest("a");
    await userEvent.click(patLink!);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/profile/patient/pat-1"));

    const repLink = screen.getByText("Report One").closest("a");
    await userEvent.click(repLink!);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/reports/rep-1"));
  });

  it("performs search and updates lists using the fetch actions", async () => {
    // Prepare mocked fetch results
    mockFetchPatients.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "pat-2",
          name: "Alice S",
          first_name: "Alice",
          last_name: "S",
          contact_number: "",
          country_id: 2,
          country: { country: "Y" },
          sex: "Female",
          birthdate: "1990-01-01",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reports: [{ type: { id: 2, type: "TypeA" } }],
        },
      ],
    });

    mockFetchReports.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "rep-2",
          title: "Report Two",
          description: "d",
          content: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          language_id: 1,
          patient_id: "pat-2",
          therapist_id: "ther-2",
          type_id: 2,
          therapist: {
            id: "ther-2",
            name: "Therapist Two",
            first_name: "X",
            last_name: "Y",
            picture: "",
            bio: "",
            age: 35,
            clinic_id: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            clinic: { clinic: "C", country_id: 2, id: 2, country: { country: "Y", id: 2 } },
          },
          type: { id: 2, type: "Type" },
          language: { id: 1, code: "en", language: "English" },
          patient: {
            id: "pat-2",
            name: "Alice S",
            first_name: "Alice",
            last_name: "S",
            contact_number: "",
            country_id: 2,
            country: { country: "Y", id: 2 },
            sex: "Female" as const,
            birthdate: "1990-01-01",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            reports: [{ type: { id: 2, type: "TypeA" } }],
          },
        },
      ],
    });

    mockFetchTherapists.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "ther-2",
          name: "Therapist Two",
          first_name: "Therapist",
          last_name: "Two",
          picture: "",
          bio: "Bio",
          age: 35,
          clinic_id: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          clinic: { clinic: "Z", country_id: 2, id: 2, country: { country: "Y", id: 2 } },
          reports: [],
        },
      ],
    });

    render(
      <SearchAllClient
        initialPatients={initialPatients}
        initialReports={initialReports}
        initialTherapists={initialTherapists}
      />
    );

    // Use the Search input in the header
  // Query by role to avoid relying on placeholder text (more robust)
  const input = screen.getByRole("textbox") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "Alice");
    // Press Enter to trigger onSearch
    await userEvent.keyboard("{Enter}");

    // The mocked fetches should be invoked and new items rendered
    await waitFor(() => expect(mockFetchPatients).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("Alice S")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Report Two")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Therapist Two")).toBeInTheDocument());
  });
});
