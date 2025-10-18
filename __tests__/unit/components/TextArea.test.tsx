import React from "react";
import { render } from "@testing-library/react";
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
    }

    describe("Rendering", () => {
        it("renders the TextArea component without crashing", () => {
            const { getByLabelText } = render(<TextArea {...defaultProps} />);
            const textareaElement = getByLabelText(labelText) as HTMLTextAreaElement;
            expect(textareaElement).toBeInTheDocument();
        });

        it("renders the TextArea component with label and placeholder", () => {
            const { getByLabelText } = render(<TextArea {...defaultProps} />);
            const textareaElement = getByLabelText(labelText) as HTMLTextAreaElement;
            expect(textareaElement).toBeInTheDocument();
            expect(textareaElement.placeholder).toBe(placeholderText);
        });
    });

    describe("Props validation", () => {
        it("applies the required attribute when required prop is true", () => {
            const { getByLabelText } = render(<TextArea {...defaultProps} required={true} />);
            // When required is true, an asterisk is appended to the label text in the DOM
            const labelMatcher = new RegExp(`^${labelText}\\s*\\*?$`);
            const textareaElement = getByLabelText(labelMatcher) as HTMLTextAreaElement;
            expect(textareaElement.required).toBe(true);
        });

        it("applies the disabled attribute when disabled prop is true", () => {
            const { getByLabelText } = render(<TextArea {...defaultProps} disabled={true} />);
            const textareaElement = getByLabelText(labelText) as HTMLTextAreaElement;
            expect(textareaElement.disabled).toBe(true);
        });

        it("limits the maximum length of input when maxLength prop is set", () => {
            const maxLength = 10;
            const { getByLabelText } = render(<TextArea {...defaultProps} maxLength={maxLength} />);
            const textareaElement = getByLabelText(labelText) as HTMLTextAreaElement;
            expect(textareaElement.maxLength).toBe(maxLength);
        });
    });

    describe("Input Handling", () => {
        it("displays the correct value in the textarea", () => {
            const testValue = "Test input value";
            const { getByLabelText } = render(<TextArea {...defaultProps} value={testValue} />);
            const textareaElement = getByLabelText(labelText) as HTMLTextAreaElement;
            expect(textareaElement.value).toBe(testValue);
        });
        it("shows a character counter when maxLength is provided", () => {
            const { getByText } = render(
                <TextArea {...defaultProps} value={"Hello"} maxLength={10} />
            );
            expect(getByText("5/10")).toBeInTheDocument();
        });
        it("calls onChange handler when text is entered", async () => {
            const user = userEvent.setup();
            const { getByLabelText } = render(<TextArea {...defaultProps} />);
            const textarea = getByLabelText(labelText) as HTMLTextAreaElement;
            await user.type(textarea, "New text");
            expect(mockOnChange).toHaveBeenCalled();
            expect(textarea.value).toBe("New text");
        });
        it("no longer displays the placeholder when user types", async () => {
            const user = userEvent.setup();
            const { getByLabelText } = render(<TextArea {...defaultProps} />);
            const textarea = getByLabelText(labelText) as HTMLTextAreaElement;
            expect(textarea.placeholder).toBe(placeholderText);
            await user.type(textarea, "User input");
            expect(textarea.value).toBe("User input");
        });

        it("does not accept user input when disabled", async () => {
            const user = userEvent.setup();
            const { getByLabelText } = render(
              <TextArea {...defaultProps} disabled={true} />
            );
            const textarea = getByLabelText(labelText) as HTMLTextAreaElement;
            expect(textarea).toBeDisabled();
            // userEvent.type will skip disabled elements and won't type anything
            await user.type(textarea, "Attempted input");
            expect(textarea.value).toBe(""); // Value stays empty because disabled prevents input
        });
    });
});