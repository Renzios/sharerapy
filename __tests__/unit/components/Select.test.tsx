import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "@/components/general/Select";

// Mock react-select for simpler testing
jest.mock("react-select", () => {
  return {
    __esModule: true,
    default: ({ options, value, onChange, placeholder, isDisabled, instanceId }: any) => (
      <select
        data-testid={`select-${instanceId}`}
        value={value?.value || ""}
        onChange={(e) => {
          const selectedOption = options.find((opt: any) => opt.value === e.target.value);
          onChange(selectedOption || null);
        }}
        disabled={isDisabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
  };
});

describe("Select Component", () => {
  const mockOnChange = jest.fn();

  const defaultOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  const defaultProps = {
    options: defaultOptions,
    value: null,
    onChange: mockOnChange,
    instanceId: "test-select",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(<Select {...defaultProps} />);
      
      expect(screen.getByTestId("select-test-select")).toBeInTheDocument();
    });

    it("renders with default placeholder", () => {
      render(<Select {...defaultProps} />);
      
      expect(screen.getByDisplayValue("Select...")).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      render(<Select {...defaultProps} placeholder="Choose an option" />);
      
      expect(screen.getByDisplayValue("Choose an option")).toBeInTheDocument();
    });

    it("renders all provided options", () => {
      render(<Select {...defaultProps} />);
      
      defaultOptions.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  describe("Label Functionality", () => {
    it("renders label when provided", () => {
      render(<Select {...defaultProps} label="Test Label" />);
      
      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("does not render label when not provided", () => {
      render(<Select {...defaultProps} />);
      
      expect(screen.queryByRole("label")).not.toBeInTheDocument();
    });

    it("shows required asterisk when required is true", () => {
      render(<Select {...defaultProps} label="Required Field" required={true} />);
      
      expect(screen.getByText("Required Field")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("does not show required asterisk when required is false", () => {
      render(<Select {...defaultProps} label="Optional Field" required={false} />);
      
      expect(screen.getByText("Optional Field")).toBeInTheDocument();
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });
  });

  describe("Selection Functionality", () => {
    it("calls onChange when an option is selected", async () => {
      const user = userEvent.setup();
      render(<Select {...defaultProps} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      await user.selectOptions(selectInput, "option1");
      
      expect(mockOnChange).toHaveBeenCalledWith(defaultOptions[0]);
    });

    it("displays selected value correctly", () => {
      render(<Select {...defaultProps} value={defaultOptions[1]} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      expect(selectInput).toHaveValue("option2");
    });

    it("can clear selection", async () => {
      const user = userEvent.setup();
      render(<Select {...defaultProps} value={defaultOptions[0]} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      await user.selectOptions(selectInput, "");
      
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it("handles selection change correctly", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Select {...defaultProps} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      
      // Select first option
      await user.selectOptions(selectInput, "option1");
      expect(mockOnChange).toHaveBeenCalledWith(defaultOptions[0]);
      
      // Update props to reflect selection
      rerender(<Select {...defaultProps} value={defaultOptions[0]} />);
      expect(selectInput).toHaveValue("option1");
      
      // Select different option
      await user.selectOptions(selectInput, "option3");
      expect(mockOnChange).toHaveBeenCalledWith(defaultOptions[2]);
    });
  });

  describe("Disabled State", () => {
    it("is enabled by default", () => {
      render(<Select {...defaultProps} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      expect(selectInput).not.toBeDisabled();
    });

    it("can be disabled", () => {
      render(<Select {...defaultProps} disabled={true} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      expect(selectInput).toBeDisabled();
    });

    it("does not call onChange when disabled", async () => {
      const user = userEvent.setup();
      render(<Select {...defaultProps} disabled={true} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      
      // Try to interact with disabled select - this should not trigger onChange
      try {
        await user.selectOptions(selectInput, "option1");
      } catch (error) {
        // Expected to fail for disabled element
      }
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });


  describe("Options Handling", () => {
    it("handles empty options array", () => {
      render(<Select {...defaultProps} options={[]} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      expect(selectInput).toBeInTheDocument();
      // Should only have the placeholder option
      expect(selectInput.children).toHaveLength(1);
    });

    it("handles single option", () => {
      const singleOption = [{ value: "only", label: "Only Option" }];
      render(<Select {...defaultProps} options={singleOption} />);
      
      expect(screen.getByText("Only Option")).toBeInTheDocument();
    });

    it("handles options with special characters", () => {
      const specialOptions = [
        { value: "special", label: "Option with émojis 🎉" },
        { value: "unicode", label: "Spëcîål Chärs" },
      ];
      render(<Select {...defaultProps} options={specialOptions} />);
      
      expect(screen.getByText("Option with émojis 🎉")).toBeInTheDocument();
      expect(screen.getByText("Spëcîål Chärs")).toBeInTheDocument();
    });

    it("handles long option labels", () => {
      const longOptions = [
        { 
          value: "long", 
          label: "This is a long option label that might cause layout issues if not handled properly" 
        },
      ];
      render(<Select {...defaultProps} options={longOptions} />);
      
      expect(screen.getByText(/This is a long option label/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null value gracefully", () => {
      render(<Select {...defaultProps} value={null} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      expect(selectInput).toHaveValue("");
    });

    it("handles undefined value gracefully", () => {
      render(<Select {...defaultProps} value={undefined as any} />);
      
      const selectInput = screen.getByTestId("select-test-select");
      expect(selectInput).toHaveValue("");
    });
  });
});
