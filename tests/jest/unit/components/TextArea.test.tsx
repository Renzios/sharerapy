import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextArea from "@/components/general/TextArea";

describe("TextArea Component", () => {
  const mockOnChange = jest.fn();
  const labelText = "Test TextArea Label";
  const placeholderText = "Enter text here...";
  const inputId = "test-textarea";
  const defaultProps = {
    label: labelText,
    placeholder: placeholderText,
    onChange: mockOnChange,
    id: inputId,
  };

  describe("Rendering", () => {
    describe("Basic rendering", () => {
      it("renders the TextArea component without crashing", () => {
        render(<TextArea {...defaultProps} />);
        const textareaElement = screen.getByLabelText(labelText) as HTMLTextAreaElement;
        expect(textareaElement).toBeInTheDocument();
      });

      it("renders the TextArea component with label and placeholder", () => {
        render(<TextArea {...defaultProps} />);
        const textareaElement = screen.getByLabelText(labelText) as HTMLTextAreaElement;
        expect(textareaElement).toBeInTheDocument();
        expect(textareaElement.placeholder).toBe(placeholderText);
      });
    });

    describe("Label functionality", () => {
      it("renders the label when provided", () => {
        render(<TextArea {...defaultProps} />);
        const labelElement = screen.getByText(labelText);
        expect(labelElement).toBeInTheDocument();
      });

      it("displays an asterisk for required fields", () => {
        render(<TextArea {...defaultProps} label="Required Field" required={true} />);
        expect(screen.getByText("Required Field")).toBeInTheDocument();
        expect(screen.getByText("*")).toBeInTheDocument();
      });
    });
  });

  describe("Props validation", () => {
    it("applies the required attribute when required prop is true", () => {
      render(<TextArea {...defaultProps} required={true} />);
      // When required is true, an asterisk is appended to the label text in the DOM
      const labelMatcher = new RegExp(`^${labelText}\\s*\\*?$`);
      const textareaElement = screen.getByLabelText(labelMatcher) as HTMLTextAreaElement;
      expect(textareaElement.required).toBe(true);
    });

    it("applies the disabled attribute when disabled prop is true", () => {
      render(<TextArea {...defaultProps} disabled={true} />);
      const textareaElement = screen.getByLabelText(labelText) as HTMLTextAreaElement;
      expect(textareaElement.disabled).toBe(true);
    });
  });

  describe("User Interaction", () => {
    it("displays the correct value in the textarea", () => {
      const testValue = "Test input value";
      render(<TextArea {...defaultProps} value={testValue} />);
      const textareaElement = screen.getByLabelText(labelText) as HTMLTextAreaElement;
      expect(textareaElement.value).toBe(testValue);
    });

    it("shows a character counter when maxLength is provided", () => {
      render(<TextArea {...defaultProps} value={"Hello"} maxLength={10} />);
      expect(screen.getByText("5/10")).toBeInTheDocument();
    });

    it("calls onChange handler when text is entered", async () => {
      const user = userEvent.setup();
      render(<TextArea {...defaultProps} />);
      const textarea = screen.getByLabelText(labelText) as HTMLTextAreaElement;
      await user.type(textarea, "New text");
      expect(mockOnChange).toHaveBeenCalled();
      expect(textarea.value).toBe("New text");
    });

    it("no longer displays the placeholder when user types", async () => {
      const user = userEvent.setup();
      render(<TextArea {...defaultProps} />);
      const textarea = screen.getByLabelText(labelText) as HTMLTextAreaElement;
      expect(textarea.placeholder).toBe(placeholderText);
      await user.type(textarea, "User input");
      expect(textarea.value).toBe("User input");
    });

    it("does not accept user input when disabled", async () => {
      const user = userEvent.setup();
      render(<TextArea {...defaultProps} disabled={true} />);
      const textarea = screen.getByLabelText(labelText) as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
      // userEvent.type will skip disabled elements and won't type anything
      await user.type(textarea, "Attempted input");
      expect(textarea.value).toBe(""); // Value stays empty because disabled prevents input
    });  

    it("enforces maxLength on user input", async () => {
      const user = userEvent.setup();
      render(<TextArea {...defaultProps} maxLength={5} />);
      const textarea = screen.getByLabelText(labelText) as HTMLTextAreaElement;
      await user.type(textarea, "ExceedingLength");
      expect(textarea.value.length).toBe(5);
      expect(textarea.value).toBe("Excee");
    });

    it("supports foreign characters", async () => {
      const user = userEvent.setup();
      render(<TextArea {...defaultProps} />);
      const textarea = screen.getByLabelText(labelText) as HTMLTextAreaElement;
      await user.type(textarea, "输入Киирии");
      expect(textarea.value).toBe("输入Киирии");
    });
  });    
});   