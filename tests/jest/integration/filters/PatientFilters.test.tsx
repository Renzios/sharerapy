import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientFilters from "@/components/filters/PatientFilters";

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key),
  }),
}));

// Mock child components
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

jest.mock("@/components/general/Select", () => {
  const Component = ({
    label,
    instanceId,
    options,
    value,
    onChange,
    placeholder,
  }: {
    label?: string;
    instanceId?: string;
    options?: Array<{ value: string; label: string }>;
    value?: { value: string; label: string } | null;
    onChange?: (val: { value: string; label: string } | null) => void;
    placeholder?: string;
  }) => (
    <div data-testid={`select-container-${instanceId}`}>
      {label && <label>{label}</label>}
      <select
        data-testid={`select-${instanceId}`}
        value={value?.value || ""}
        onChange={(e) => {
          const selectedOption = options?.find(
            (opt) => opt.value === e.target.value
          );
          onChange?.(selectedOption || null);
        }}
      >
        <option value="">{placeholder || "Select..."}</option>
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

describe("PatientFilters", () => {
  const mockOnClose = jest.fn();
  const mockOnUpdateParams = jest.fn();

  const defaultCountryOptions = [
    { value: "1", label: "Philippines" },
    { value: "2", label: "United States" },
    { value: "3", label: "Japan" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete("sex");
    mockSearchParams.delete("country");
  });

  describe("Rendering", () => {
    it("renders all filter controls", () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      expect(screen.getByText("Country")).toBeInTheDocument();
      expect(screen.getByText("Sex")).toBeInTheDocument();
      expect(screen.getByTestId("select-filter-country-select")).toBeInTheDocument();
      expect(screen.getByTestId("select-filter-sex-select")).toBeInTheDocument();
      expect(screen.getByText("Clear All")).toBeInTheDocument();
      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });

    it("renders country options correctly", () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const countrySelect = screen.getByTestId("select-filter-country-select");
      expect(countrySelect).toBeInTheDocument();
      
      const options = countrySelect.querySelectorAll("option");
      expect(options.length).toBe(4); // placeholder + 3 countries
      expect(options[1]).toHaveTextContent("Philippines");
      expect(options[2]).toHaveTextContent("United States");
      expect(options[3]).toHaveTextContent("Japan");
    });

    it("renders sex options correctly", () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const sexSelect = screen.getByTestId("select-filter-sex-select");
      const options = sexSelect.querySelectorAll("option");
      
      expect(options.length).toBe(3); // placeholder + Male + Female
      expect(options[1]).toHaveTextContent("Male");
      expect(options[2]).toHaveTextContent("Female");
    });

    it("initializes with empty values when no URL params", () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const countrySelect = screen.getByTestId("select-filter-country-select") as HTMLSelectElement;
      const sexSelect = screen.getByTestId("select-filter-sex-select") as HTMLSelectElement;

      expect(countrySelect.value).toBe("");
      expect(sexSelect.value).toBe("");
    });

    it("initializes with values from URL params", () => {
      mockSearchParams.set("sex", "Male");
      mockSearchParams.set("country", "1");

      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const countrySelect = screen.getByTestId("select-filter-country-select") as HTMLSelectElement;
      const sexSelect = screen.getByTestId("select-filter-sex-select") as HTMLSelectElement;

      expect(countrySelect.value).toBe("1");
      expect(sexSelect.value).toBe("Male");
    });

    it("handles invalid country param gracefully", () => {
      mockSearchParams.set("country", "invalid-id");

      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const countrySelect = screen.getByTestId("select-filter-country-select") as HTMLSelectElement;
      expect(countrySelect.value).toBe("");
    });

    it("supports non-latin characters in country names", () => {
      const internationalOptions = [
        { value: "81", label: "日本" },
        { value: "82", label: "中国" },
        { value: "83", label: "한국" },
      ];

      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={internationalOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      expect(screen.getByText("日本")).toBeInTheDocument();
      expect(screen.getByText("中国")).toBeInTheDocument();
      expect(screen.getByText("한국")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("updates sex when user selects an option", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const sexSelect = screen.getByTestId("select-filter-sex-select");
      fireEvent.change(sexSelect, { target: { value: "Male" } });

      expect((sexSelect as HTMLSelectElement).value).toBe("Male");
    });

    it("updates country when user selects an option", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const countrySelect = screen.getByTestId("select-filter-country-select");
      fireEvent.change(countrySelect, { target: { value: "2" } });

      expect((countrySelect as HTMLSelectElement).value).toBe("2");
    });

    it("allows changing selections multiple times", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const sexSelect = screen.getByTestId("select-filter-sex-select");
      
      fireEvent.change(sexSelect, { target: { value: "Male" } });
      expect((sexSelect as HTMLSelectElement).value).toBe("Male");

      fireEvent.change(sexSelect, { target: { value: "Female" } });
      expect((sexSelect as HTMLSelectElement).value).toBe("Female");

      fireEvent.change(sexSelect, { target: { value: "" } });
      expect((sexSelect as HTMLSelectElement).value).toBe("");
    });

    it("clears both filters when Clear All is clicked", async () => {
      mockSearchParams.set("sex", "Male");
      mockSearchParams.set("country", "1");

      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const clearButton = screen.getByText("Clear All");
      fireEvent.click(clearButton);

      const countrySelect = screen.getByTestId("select-filter-country-select") as HTMLSelectElement;
      const sexSelect = screen.getByTestId("select-filter-sex-select") as HTMLSelectElement;

      expect(countrySelect.value).toBe("");
      expect(sexSelect.value).toBe("");
      expect(mockOnUpdateParams).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("calls onUpdateParams with correct values when Apply is clicked", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const sexSelect = screen.getByTestId("select-filter-sex-select");
      const countrySelect = screen.getByTestId("select-filter-country-select");

      fireEvent.change(sexSelect, { target: { value: "Female" } });
      fireEvent.change(countrySelect, { target: { value: "3" } });

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        sex: "Female",
        country: "3",
        p: 1,
      });
    });

    it("calls onClose when Apply is clicked", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("sends null values for unselected filters when Apply is clicked", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        sex: null,
        country: null,
        p: 1,
      });
    });

    it("resets page to 1 when filters are applied", async () => {
      mockSearchParams.set("p", "5");

      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const sexSelect = screen.getByTestId("select-filter-sex-select");
      fireEvent.change(sexSelect, { target: { value: "Male" } });

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        sex: "Male",
        country: null,
        p: 1,
      });
    });

    it("handles applying only sex filter", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const sexSelect = screen.getByTestId("select-filter-sex-select");
      fireEvent.change(sexSelect, { target: { value: "Male" } });

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        sex: "Male",
        country: null,
        p: 1,
      });
    });

    it("handles applying only country filter", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const countrySelect = screen.getByTestId("select-filter-country-select");
      fireEvent.change(countrySelect, { target: { value: "2" } });

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        sex: null,
        country: "2",
        p: 1,
      });
    });
  });

  describe("Button Variants", () => {
    it("renders Clear All button with outline variant", () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const clearButton = screen.getByTestId("button-outline");
      expect(clearButton).toHaveTextContent("Clear All");
      expect(clearButton).toHaveAttribute("data-variant", "outline");
    });

    it("renders Apply Filters button with filled variant", () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const applyButton = screen.getByTestId("button-filled");
      expect(applyButton).toHaveTextContent("Apply Filters");
      expect(applyButton).toHaveAttribute("data-variant", "filled");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty country options array", () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={[]}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const countrySelect = screen.getByTestId("select-filter-country-select");
      const options = countrySelect.querySelectorAll("option");
      
      expect(options.length).toBe(1); // Only placeholder
    });

    it("handles rapid filter changes before applying", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const sexSelect = screen.getByTestId("select-filter-sex-select");
      const countrySelect = screen.getByTestId("select-filter-country-select");

      fireEvent.change(sexSelect, { target: { value: "Male" } });
      fireEvent.change(sexSelect, { target: { value: "Female" } });
      fireEvent.change(countrySelect, { target: { value: "1" } });
      fireEvent.change(countrySelect, { target: { value: "2" } });

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      // Should use the last selected values
      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        sex: "Female",
        country: "2",
        p: 1,
      });
    });

    it("handles clearing after selecting and before applying", async () => {
      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const sexSelect = screen.getByTestId("select-filter-sex-select");
      const countrySelect = screen.getByTestId("select-filter-country-select");

      // Select values
      fireEvent.change(sexSelect, { target: { value: "Male" } });
      fireEvent.change(countrySelect, { target: { value: "1" } });

      // Clear
      const clearButton = screen.getByText("Clear All");
      fireEvent.click(clearButton);

      // Apply
      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        sex: null,
        country: null,
        p: 1,
      });
    });

    it("maintains selections after clearing without applying", async () => {
      mockSearchParams.set("sex", "Male");
      mockSearchParams.set("country", "1");

      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      // Clear the form
      const clearButton = screen.getByText("Clear All");
      fireEvent.click(clearButton);

      // Selections should be cleared in UI
      const countrySelect = screen.getByTestId("select-filter-country-select") as HTMLSelectElement;
      const sexSelect = screen.getByTestId("select-filter-sex-select") as HTMLSelectElement;

      expect(countrySelect.value).toBe("");
      expect(sexSelect.value).toBe("");
    });

    it("handles applying filters without making any changes", async () => {
      mockSearchParams.set("sex", "Male");
      mockSearchParams.set("country", "1");

      render(
        <PatientFilters
          onClose={mockOnClose}
          countryOptions={defaultCountryOptions}
          onUpdateParams={mockOnUpdateParams}
        />
      );

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnUpdateParams).toHaveBeenCalledWith({
        sex: "Male",
        country: "1",
        p: 1,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
