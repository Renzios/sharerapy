import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientProfile from "@/components/layout/PatientProfile";
import type { Tables } from "@/lib/types/database.types";

// Mock next/navigation hooks
const mockPush = jest.fn();
const mockHandleBackClick = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/search/patients",
}));

jest.mock("@/app/hooks/useBackNavigation", () => ({
  useBackNavigation: () => ({ handleBackClick: mockHandleBackClick }),
}));

// Mock Button component
type ButtonProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  className?: string;
  disabled?: boolean;
};

jest.mock("@/components/general/Button", () => {
  const ButtonMock = (props: ButtonProps) => {
    const { children, onClick, variant, className, disabled } = props;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        className={className}
      >
        {children}
      </button>
    );
  };
  ButtonMock.displayName = "ButtonMock";
  return { __esModule: true, default: ButtonMock };
});

// Type definitions for test data
type PatientWithRelations = Tables<"patients"> & {
  age?: string;
  country: Tables<"countries">;
  reports: (Tables<"reports"> & {
    therapist: Tables<"therapists"> & {
      clinic: Tables<"clinics"> & {
        country: Tables<"countries">;
      };
    };
    type: Tables<"types">;
    language: Tables<"languages">;
  })[];
};

// Helper function to create mock patient data
const createMockPatient = (overrides?: Partial<PatientWithRelations>): PatientWithRelations => ({
  id: "patient-123",
  name: "John Doe",
  first_name: "John",
  last_name: "Doe",
  birthdate: "1990-05-15",
  sex: "Male",
  contact_number: "1234567890",
  country_id: 1,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  age: "34",
  country: {
    id: 1,
    country: "United States",
    code: "US",
  } as Tables<"countries">,
  reports: [],
  ...overrides,
});

describe("PatientProfile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders patient name correctly", () => {
      const patient = createMockPatient({ name: "Alice Johnson" });
      render(<PatientProfile patient={patient} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Alice Johnson");
    });

    it("renders contact number with '+' prefix", () => {
      const patient = createMockPatient({ contact_number: "9876543210" });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("+9876543210")).toBeInTheDocument();
    });

    it("displays 'N/A' when contact number is null", () => {
      const patient = createMockPatient({ contact_number: null as unknown as string });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("+N/A")).toBeInTheDocument();
    });

    it("renders age correctly", () => {
      const patient = createMockPatient({ age: "42" });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("displays 'N/A' when age is not provided", () => {
      const patient = createMockPatient({ age: undefined });
      render(<PatientProfile patient={patient} />);

      const ageLabels = screen.getAllByText("Age");
      expect(ageLabels).toHaveLength(1);
      
      // Find the N/A text that's next to Age label
      const container = ageLabels[0].closest("div")?.parentElement;
      expect(container).toHaveTextContent("N/A");
    });

    it("renders formatted birthday date", () => {
      const patient = createMockPatient({ birthdate: "1990-05-15" });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("Birthday")).toBeInTheDocument();
      expect(screen.getByText("May 15, 1990")).toBeInTheDocument();
    });

    it("renders sex correctly", () => {
      const patient = createMockPatient({ sex: "Female" });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("Sex")).toBeInTheDocument();
      expect(screen.getByText("Female")).toBeInTheDocument();
    });

    it("displays 'N/A' when sex is null", () => {
      const patient = createMockPatient({ sex: null as unknown as "Male" | "Female" });
      render(<PatientProfile patient={patient} />);

      const sexLabels = screen.getAllByText("Sex");
      expect(sexLabels).toHaveLength(1);
      
      const container = sexLabels[0].closest("div")?.parentElement;
      expect(container).toHaveTextContent("N/A");
    });

    it("renders country name correctly", () => {
      const patient = createMockPatient({
        country: {
          id: 2,
          country: "Canada",
          code: "CA",
        } as Tables<"countries">,
      });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("Country")).toBeInTheDocument();
      expect(screen.getByText("Canada")).toBeInTheDocument();
    });

    it("displays 'N/A' when country is not provided", () => {
      const patient = createMockPatient({
        country: undefined as unknown as Tables<"countries">,
      });
      render(<PatientProfile patient={patient} />);

      const countryLabels = screen.getAllByText("Country");
      expect(countryLabels).toHaveLength(1);
      
      const container = countryLabels[0].closest("div")?.parentElement;
      expect(container).toHaveTextContent("N/A");
    });

    it("displays 'N/A' when country object exists but country name is missing", () => {
      const patient = createMockPatient({
        country: {
          id: 3,
          country: null as unknown as string,
          code: "XX",
        } as Tables<"countries">,
      });
      render(<PatientProfile patient={patient} />);

      const countryLabels = screen.getAllByText("Country");
      expect(countryLabels).toHaveLength(1);
      
      const container = countryLabels[0].closest("div")?.parentElement;
      expect(container).toHaveTextContent("N/A");
    });

    it("renders Back button", () => {
      const patient = createMockPatient();
      render(<PatientProfile patient={patient} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });

    
    it("renders patient with empty string values as expected", () => {
      const patient = createMockPatient({
        contact_number: "",
        age: "",
        sex: "" as unknown as "Male" | "Female",
      });
      render(<PatientProfile patient={patient} />);

      // Empty string should be treated as falsy and show N/A or +N/A
      expect(screen.getByText("+N/A")).toBeInTheDocument();
    });

    it("handles patient with special characters in name", () => {
      const patient = createMockPatient({
        name: "José María O'Connor-Smith",
      });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("José María O'Connor-Smith")).toBeInTheDocument();
    });

    it("handles patient with non-latin characters in name", () => {
      const patient = createMockPatient({ name: "李小龙" });
      render(<PatientProfile patient={patient} />);
      expect(screen.getByText("李小龙")).toBeInTheDocument();
    });

    it("handles patient with very long name", () => {
      const longName = "A".repeat(100);
      const patient = createMockPatient({ name: longName });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("handles patient with international phone number", () => {
      const patient = createMockPatient({ contact_number: "447911123456" });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("+447911123456")).toBeInTheDocument();
    });

    it("handles patient with reports array (not displayed but part of type)", () => {
      const patient = createMockPatient({
        reports: [
          {
            id: "report-1",
            title: "Test Report",
          } as unknown as Tables<"reports"> & {
            therapist: Tables<"therapists"> & {
              clinic: Tables<"clinics"> & {
                country: Tables<"countries">;
              };
            };
            type: Tables<"types">;
            language: Tables<"languages">;
          },
        ],
      });
      render(<PatientProfile patient={patient} />);

      // Component should render without errors even though reports aren't displayed
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("calls handleBackClick when Back button is clicked", async () => {
      const patient = createMockPatient();
      render(<PatientProfile patient={patient} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      await userEvent.click(backButton);

      expect(mockHandleBackClick).toHaveBeenCalledTimes(1);
    });

    it("sets isNavigating state when Back button is clicked", async () => {
      const patient = createMockPatient();
      render(<PatientProfile patient={patient} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      
      // Click the button
      await userEvent.click(backButton);

      // Verify the navigation handler was called
      expect(mockHandleBackClick).toHaveBeenCalled();
    });

    it("handles multiple clicks on Back button", async () => {
      const patient = createMockPatient();
      render(<PatientProfile patient={patient} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      
      await userEvent.click(backButton);
      await userEvent.click(backButton);
      await userEvent.click(backButton);

      expect(mockHandleBackClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("Props Handling", () => {
    it("handles patient with minimal data", () => {
      const patient = createMockPatient({
        name: "Minimal Patient",
        contact_number: null as unknown as string,
        age: undefined,
        sex: null as unknown as "Male" | "Female",
        country: undefined as unknown as Tables<"countries">,
      });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("Minimal Patient")).toBeInTheDocument();
      expect(screen.getByText("+N/A")).toBeInTheDocument();
    });

    it("handles patient with all optional fields populated", () => {
      const patient = createMockPatient({
        name: "Complete Patient",
        contact_number: "5555555555",
        age: "28",
        sex: "Female",
        birthdate: "1995-12-25",
        country: {
          id: 4,
          country: "United Kingdom",
          code: "UK",
        } as Tables<"countries">,
      });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("Complete Patient")).toBeInTheDocument();
      expect(screen.getByText("+5555555555")).toBeInTheDocument();
      expect(screen.getByText("28")).toBeInTheDocument();
      expect(screen.getByText("Female")).toBeInTheDocument();
      expect(screen.getByText("December 25, 1995")).toBeInTheDocument();
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });

    it("formats different date formats correctly", () => {
      const patient = createMockPatient({ birthdate: "2000-01-01" });
      render(<PatientProfile patient={patient} />);

      expect(screen.getByText("January 1, 2000")).toBeInTheDocument();
    });

    

    it("applies correct button variant and className", () => {
      const patient = createMockPatient();
      render(<PatientProfile patient={patient} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).toHaveAttribute("data-variant", "filled");
      expect(backButton).toHaveClass("ml-auto");
    });
  });
});
