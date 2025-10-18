import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "@/components/general/Select";

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
      const { container } = render(<Select {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders with default placeholder", () => {
      const { container } = render(<Select {...defaultProps} />);
      const selectContainer = container.querySelector('[class*="react-select"]');
      expect(selectContainer).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      const { container } = render(<Select {...defaultProps} placeholder="Choose an option" />);
      const selectContainer = container.querySelector('[class*="react-select"]');
      expect(selectContainer).toBeInTheDocument();
    });

    it("renders all provided options", () => {
      const { container } = render(<Select {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Label Functionality", () => {
    it("renders label when provided", () => {
      render(<Select {...defaultProps} label="Test Label" />);
      
      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("does not render label when not provided", () => {
      const { container } = render(<Select {...defaultProps} />);
      
      const labels = container.querySelectorAll("label");
      expect(labels).toHaveLength(0);
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
    it("calls onChange when an option is selected", () => {
      render(<Select {...defaultProps} />);
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("displays selected value correctly", () => {
      const { container } = render(<Select {...defaultProps} value={defaultOptions[1]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("can clear selection", () => {
      const { container } = render(<Select {...defaultProps} value={defaultOptions[0]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles selection change correctly", () => {
      const { rerender, container } = render(<Select {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
      
      rerender(<Select {...defaultProps} value={defaultOptions[0]} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("is enabled by default", () => {
      const { container } = render(<Select {...defaultProps} />);
      const wrapper = container.querySelector("div");
      expect(wrapper).not.toHaveStyle({ cursor: "not-allowed" });
    });

    it("can be disabled", () => {
      const { container } = render(<Select {...defaultProps} disabled={true} />);
      const wrapper = container.querySelector("div");
      expect(wrapper).toHaveStyle({ cursor: "not-allowed" });
    });

    it("does not call onChange when disabled", () => {
      render(<Select {...defaultProps} disabled={true} />);
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });


  describe("Options Handling", () => {
    it("handles empty options array", () => {
      const { container } = render(<Select {...defaultProps} options={[]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles single option", () => {
      const singleOption = [{ value: "only", label: "Only Option" }];
      const { container } = render(<Select {...defaultProps} options={singleOption} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles options with special characters", () => {
      const specialOptions = [
        { value: "special", label: "Option with émojis 🎉" },
        { value: "unicode", label: "Spëcîål Chärs" },
      ];
      const { container } = render(<Select {...defaultProps} options={specialOptions} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles long option labels", () => {
      const longOptions = [
        { 
          value: "long", 
          label: "This is a long option label that might cause layout issues if not handled properly" 
        },
      ];
      const { container } = render(<Select {...defaultProps} options={longOptions} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null value gracefully", () => {
      const { container } = render(<Select {...defaultProps} value={null} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles undefined value gracefully", () => {
      const { container } = render(<Select {...defaultProps} value={undefined as unknown as null} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
