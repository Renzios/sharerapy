import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ReportFilters from "@/components/filters/ReportFilters";

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key),
  }),
}));

// Mock Button component
jest.mock("@/components/general/Button", () => {
  const Component = ({
    children,
    onClick,
    variant,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      className={className}
      data-testid={`button-${variant}`}
    >
      {children}
    </button>
  );
  Component.displayName = "Button";
  return Component;
});

// Mock Select component
jest.mock("@/components/general/Select", () => {
  const Component = ({
    label,
    instanceId,
    options,
    value,
    onChange,
    placeholder,
    isMulti,
  }: {
    label?: string;
    instanceId?: string;
    options?: Array<{ value: string; label: string }>;
    value?: { value: string; label: string } | Array<{ value: string; label: string }> | null;
    onChange?: (val: { value: string; label: string } | Array<{ value: string; label: string }> | null) => void;
    placeholder?: string;
    isMulti?: boolean;
  }) => (
    <div data-testid={`select-container-${instanceId}`}>
      {label && <label>{label}</label>}
      <select
        data-testid={`select-${instanceId}`}
        value={isMulti ? undefined : (Array.isArray(value) ? "" : value?.value || "")}
        multiple={isMulti}
        onChange={(e) => {
          if (isMulti) {
            const selected = Array.from(e.target.selectedOptions).map((opt) =>
              options?.find((o) => o.value === opt.value)
            ).filter(Boolean);
            onChange?.(selected);
          } else {
            const selectedOption = options?.find((opt) => opt.value === e.target.value);
            onChange?.(selectedOption || null);
          }
        }}
      >
        {!isMulti && <option value="">{placeholder || "Select..."}</option>}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
  Component.displayName = "Select";
  return Component;
});

// Mock Input component
jest.mock("@/components/general/Input", () => {
  const Component = ({
    label,
    type,
    value,
    onChange,
  }: {
    label?: string;
    type?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-")}`}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
  Component.displayName = "Input";
  return Component;
});

describe("ReportFilters", () => {
  const mockOnClose = jest.fn();
  const mockOnUpdateParams = jest.fn();

  const defaultProps = {
    onClose: mockOnClose,
    onUpdateParams: mockOnUpdateParams,
    languageOptions: [
      { value: "1", label: "English" },
      { value: "2", label: "Spanish" },
    ],
    countryOptions: [
      { value: "1", label: "Philippines" },
      { value: "2", label: "United States" },
    ],
    clinicOptions: [
      { value: "1", label: "Clinic A" },
      { value: "2", label: "Clinic B" },
    ],
    typeOptions: [
      { value: "1", label: "Assessment" },
      { value: "2", label: "Progress" },
      { value: "3", label: "Evaluation" },
    ],
    therapistOptions: [
      { value: "t1", label: "Dr. Smith" },
      { value: "t2", label: "Dr. Jones" },
    ],
    patientOptions: [
      { value: "p1", label: "John Doe" },
      { value: "p2", label: "Jane Doe" },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete("language");
    mockSearchParams.delete("country");
    mockSearchParams.delete("clinic");
    mockSearchParams.delete("therapist");
    mockSearchParams.delete("patient");
    mockSearchParams.delete("types");
    mockSearchParams.delete("startDate");
    mockSearchParams.delete("endDate");
  });

  describe("Rendering", () => {
    it("renders all filter controls", () => {
      render(<ReportFilters {...defaultProps} />);

      expect(screen.getByText("Start Date")).toBeInTheDocument();
      expect(screen.getByText("End Date")).toBeInTheDocument();
      expect(screen.getByText("Report Type")).toBeInTheDocument();
      expect(screen.getByText("Language")).toBeInTheDocument();
      expect(screen.getByText("Therapist")).toBeInTheDocument();
      expect(screen.getByText("Patient")).toBeInTheDocument();
      expect(screen.getByText("Clinic")).toBeInTheDocument();
      expect(screen.getByText("Therapist Country")).toBeInTheDocument();
      expect(screen.getByText("Clear")).toBeInTheDocument();
      expect(screen.getByText("Apply")).toBeInTheDocument();
    });

    it("initializes with empty values when no URL params", () => {
      render(<ReportFilters {...defaultProps} />);

      expect((screen.getByTestId("input-start-date") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("input-end-date") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("select-filter-lang-select") as HTMLSelectElement).value).toBe("");
    });

    it("initializes single selects from URL params", () => {
      mockSearchParams.set("language", "1");
      mockSearchParams.set("country", "2");
      mockSearchParams.set("clinic", "1");
      mockSearchParams.set("therapist", "t1");
      mockSearchParams.set("patient", "p2");

      render(<ReportFilters {...defaultProps} />);

      expect((screen.getByTestId("select-filter-lang-select") as HTMLSelectElement).value).toBe("1");
      expect((screen.getByTestId("select-filter-country-select") as HTMLSelectElement).value).toBe("2");
      expect((screen.getByTestId("select-filter-clinic-select") as HTMLSelectElement).value).toBe("1");
      expect((screen.getByTestId("select-filter-therapist-select") as HTMLSelectElement).value).toBe("t1");
      expect((screen.getByTestId("select-filter-patient-select") as HTMLSelectElement).value).toBe("p2");
    });

    it("initializes date inputs from URL params", () => {
      mockSearchParams.set("startDate", "2024-01-01");
      mockSearchParams.set("endDate", "2024-12-31");

      render(<ReportFilters {...defaultProps} />);

      expect((screen.getByTestId("input-start-date") as HTMLInputElement).value).toBe("2024-01-01");
      expect((screen.getByTestId("input-end-date") as HTMLInputElement).value).toBe("2024-12-31");
    });

    it("initializes multi-select types from URL params", () => {
      mockSearchParams.set("types", "1,3");

      render(<ReportFilters {...defaultProps} />);

      // Multi-select would be initialized with types array
      const typeSelect = screen.getByTestId("select-filter-type-select");
      expect(typeSelect).toBeInTheDocument();
    });

    it("handles invalid option IDs gracefully", () => {
      mockSearchParams.set("language", "invalid");
      mockSearchParams.set("country", "999");

      render(<ReportFilters {...defaultProps} />);

      expect((screen.getByTestId("select-filter-lang-select") as HTMLSelectElement).value).toBe("");
      expect((screen.getByTestId("select-filter-country-select") as HTMLSelectElement).value).toBe("");
    });

    it("supports non-latin characters in options", () => {
      const propsWithInternational = {
        ...defaultProps,
        languageOptions: [
          { value: "1", label: "日本語" },
          { value: "2", label: "中文" },
        ],
        therapistOptions: [
          { value: "t1", label: "Dr. 山田" },
          { value: "t2", label: "Dr. 李" },
        ],
      };

      render(<ReportFilters {...propsWithInternational} />);

      expect(screen.getByText("日本語")).toBeInTheDocument();
      expect(screen.getByText("中文")).toBeInTheDocument();
      expect(screen.getByText("Dr. 山田")).toBeInTheDocument();
      expect(screen.getByText("Dr. 李")).toBeInTheDocument();
    });
  });

  describe("User Interactions - Date Inputs", () => {
    it("updates start date when user enters a value", () => {
      render(<ReportFilters {...defaultProps} />);

      const startDateInput = screen.getByTestId("input-start-date");
      fireEvent.change(startDateInput, { target: { value: "2024-01-15" } });

      expect((startDateInput as HTMLInputElement).value).toBe("2024-01-15");
    });

    it("updates end date when user enters a value", () => {
      render(<ReportFilters {...defaultProps} />);

      const endDateInput = screen.getByTestId("input-end-date");
      fireEvent.change(endDateInput, { target: { value: "2024-12-15" } });

      expect((endDateInput as HTMLInputElement).value).toBe("2024-12-15");
    });

    it("allows changing dates multiple times", () => {
      render(<ReportFilters {...defaultProps} />);

      const startDateInput = screen.getByTestId("input-start-date");
      
      fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });
      expect((startDateInput as HTMLInputElement).value).toBe("2024-01-01");

      fireEvent.change(startDateInput, { target: { value: "2024-02-01" } });
      expect((startDateInput as HTMLInputElement).value).toBe("2024-02-01");
    });
  });

  describe("User Interactions - Single Selects", () => {
    it("updates language when user selects an option", () => {
      render(<ReportFilters {...defaultProps} />);

      const langSelect = screen.getByTestId("select-filter-lang-select");
      fireEvent.change(langSelect, { target: { value: "2" } });

      expect((langSelect as HTMLSelectElement).value).toBe("2");
    });

    it("updates country when user selects an option", () => {
      render(<ReportFilters {...defaultProps} />);

      const countrySelect = screen.getByTestId("select-filter-country-select");
      fireEvent.change(countrySelect, { target: { value: "1" } });

      expect((countrySelect as HTMLSelectElement).value).toBe("1");
    });

    it("updates clinic when user selects an option", () => {
      render(<ReportFilters {...defaultProps} />);

      const clinicSelect = screen.getByTestId("select-filter-clinic-select");
      fireEvent.change(clinicSelect, { target: { value: "2" } });

      expect((clinicSelect as HTMLSelectElement).value).toBe("2");
    });

    it("updates therapist when user selects an option", () => {
      render(<ReportFilters {...defaultProps} />);

      const therapistSelect = screen.getByTestId("select-filter-therapist-select");
      fireEvent.change(therapistSelect, { target: { value: "t2" } });

      expect((therapistSelect as HTMLSelectElement).value).toBe("t2");
    });

    it("updates patient when user selects an option", () => {
      render(<ReportFilters {...defaultProps} />);

      const patientSelect = screen.getByTestId("select-filter-patient-select");
      fireEvent.change(patientSelect, { target: { value: "p1" } });

      expect((patientSelect as HTMLSelectElement).value).toBe("p1");
    });
  });

  describe("User Interactions - Clear Functionality", () => {
    it("clears all single select filters", () => {
      mockSearchParams.set("language", "1");
      mockSearchParams.set("country", "2");
      mockSearchParams.set("clinic", "1");
      mockSearchParams.set("therapist", "t1");
      mockSearchParams.set("patient", "p2");

      render(<ReportFilters {...defaultProps} />);

      const clearButton = screen.getByText("Clear");
      fireEvent.click(clearButton);

      expect((screen.getByTestId("select-filter-lang-select") as HTMLSelectElement).value).toBe("");
      expect((screen.getByTestId("select-filter-country-select") as HTMLSelectElement).value).toBe("");
      expect((screen.getByTestId("select-filter-clinic-select") as HTMLSelectElement).value).toBe("");
      expect((screen.getByTestId("select-filter-therapist-select") as HTMLSelectElement).value).toBe("");
      expect((screen.getByTestId("select-filter-patient-select") as HTMLSelectElement).value).toBe("");
    });

    it("clears date filters", () => {
      mockSearchParams.set("startDate", "2024-01-01");
      mockSearchParams.set("endDate", "2024-12-31");

      render(<ReportFilters {...defaultProps} />);

      const clearButton = screen.getByText("Clear");
      fireEvent.click(clearButton);

      expect((screen.getByTestId("input-start-date") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("input-end-date") as HTMLInputElement).value).toBe("");
    });

    it("does not call onUpdateParams or onClose when clearing", () => {
      render(<ReportFilters {...defaultProps} />);

      const clearButton = screen.getByText("Clear");
      fireEvent.click(clearButton);

      expect(mockOnUpdateParams).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("User Interactions - Apply Functionality", () => {
    it("calls onUpdateParams with all selected values", () => {
      render(<ReportFilters {...defaultProps} />);

      fireEvent.change(screen.getByTestId("select-filter-lang-select"), { target: { value: "1" } });
      fireEvent.change(screen.getByTestId("select-filter-country-select"), { target: { value: "2" } });
      fireEvent.change(screen.getByTestId("select-filter-clinic-select"), { target: { value: "1" } });
      fireEvent.change(screen.getByTestId("select-filter-therapist-select"), { target: { value: "t1" } });
      fireEvent.change(screen.getByTestId("select-filter-patient-select"), { target: { value: "p2" } });
      fireEvent.change(screen.getByTestId("input-start-date"), { target: { value: "2024-01-01" } });
      fireEvent.change(screen.getByTestId("input-end-date"), { target: { value: "2024-12-31" } });

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        language: "1",
        country: "2",
        clinic: "1",
        therapist: "t1",
        patient: "p2",
        types: null,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        p: 1,
      });
    });

    it("calls onUpdateParams with null for unselected filters", () => {
      render(<ReportFilters {...defaultProps} />);

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        language: null,
        country: null,
        clinic: null,
        therapist: null,
        patient: null,
        types: null,
        startDate: null,
        endDate: null,
        p: 1,
      });
    });

    it("calls onClose when Apply is clicked", () => {
      render(<ReportFilters {...defaultProps} />);

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("resets page to 1 when filters are applied", () => {
      mockSearchParams.set("p", "10");

      render(<ReportFilters {...defaultProps} />);

      fireEvent.change(screen.getByTestId("select-filter-lang-select"), { target: { value: "1" } });

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      const call = mockOnUpdateParams.mock.calls[0][0];
      expect(call.p).toBe(1);
    });

    it("handles applying only date filters", () => {
      render(<ReportFilters {...defaultProps} />);

      fireEvent.change(screen.getByTestId("input-start-date"), { target: { value: "2024-06-01" } });

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        language: null,
        country: null,
        clinic: null,
        therapist: null,
        patient: null,
        types: null,
        startDate: "2024-06-01",
        endDate: null,
        p: 1,
      });
    });

    it("handles applying only single select filters", () => {
      render(<ReportFilters {...defaultProps} />);

      fireEvent.change(screen.getByTestId("select-filter-therapist-select"), { target: { value: "t2" } });

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        language: null,
        country: null,
        clinic: null,
        therapist: "t2",
        patient: null,
        types: null,
        startDate: null,
        endDate: null,
        p: 1,
      });
    });
  });

  describe("Button Variants", () => {
    it("renders Clear button with outline variant", () => {
      render(<ReportFilters {...defaultProps} />);

      const clearButton = screen.getByTestId("button-outline");
      expect(clearButton).toHaveTextContent("Clear");
      expect(clearButton).toHaveAttribute("data-variant", "outline");
    });

    it("renders Apply button with filled variant", () => {
      render(<ReportFilters {...defaultProps} />);

      const applyButton = screen.getByTestId("button-filled");
      expect(applyButton).toHaveTextContent("Apply");
      expect(applyButton).toHaveAttribute("data-variant", "filled");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty option arrays", () => {
      const emptyProps = {
        ...defaultProps,
        languageOptions: [],
        countryOptions: [],
        clinicOptions: [],
        typeOptions: [],
        therapistOptions: [],
        patientOptions: [],
      };

      render(<ReportFilters {...emptyProps} />);

      expect(screen.getByTestId("select-filter-lang-select")).toBeInTheDocument();
    });

    it("handles rapid changes before applying", () => {
      render(<ReportFilters {...defaultProps} />);

      const langSelect = screen.getByTestId("select-filter-lang-select");
      
      fireEvent.change(langSelect, { target: { value: "1" } });
      fireEvent.change(langSelect, { target: { value: "2" } });
      fireEvent.change(langSelect, { target: { value: "1" } });

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      const call = mockOnUpdateParams.mock.calls[0][0];
      expect(call.language).toBe("1");
    });

    it("handles clearing after selecting and before applying", () => {
      render(<ReportFilters {...defaultProps} />);

      fireEvent.change(screen.getByTestId("select-filter-lang-select"), { target: { value: "1" } });
      fireEvent.change(screen.getByTestId("input-start-date"), { target: { value: "2024-01-01" } });

      const clearButton = screen.getByText("Clear");
      fireEvent.click(clearButton);

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        language: null,
        country: null,
        clinic: null,
        therapist: null,
        patient: null,
        types: null,
        startDate: null,
        endDate: null,
        p: 1,
      });
    });

    it("handles applying without making changes when URL has params", () => {
      mockSearchParams.set("language", "1");
      mockSearchParams.set("startDate", "2024-01-01");

      render(<ReportFilters {...defaultProps} />);

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });


    it("handles empty types param string", () => {
      mockSearchParams.set("types", "");

      render(<ReportFilters {...defaultProps} />);

      const typeSelect = screen.getByTestId("select-filter-type-select");
      expect(typeSelect).toBeInTheDocument();
    });
  });
});
