import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "@/components/general/Input";

describe("Input Component", () => {
  describe("Rendering", () => {
    it("renders correctly", () => {
      render(<Input label="Test Label" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    describe("Label Rendering", () => {
      it("displays the correct label", () => {
        render(<Input label="Username" />);
        const label = screen.getByText("Username");
        expect(label).toBeInTheDocument();
      });

      it("shows asterisk when required is true", () => {
        render(<Input label="Email" required />);
        const asterisk = screen.getByText("*");
        expect(asterisk).toBeInTheDocument();
      });

      it("does not show asterisk when required is false", () => {
        render(<Input label="Email" required={false} />);
        const asterisk = screen.queryByText("*");
        expect(asterisk).not.toBeInTheDocument();
      });
      
      it("renders long labels correctly", () => {
        const longLabel = "This is a very long label to test text wrapping in the Input component";
        render(<Input label={longLabel} />);
        const label = screen.getByText(longLabel);
        expect(label).toBeInTheDocument();
      });
    });
  });

  describe("User Interaction", () => {
    it("calls onChange when input value changes", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Input label="Name" onChange={handleChange} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "John");
      expect(handleChange).toHaveBeenCalledTimes(4); // "John" has 4 characters
    });

    it("does not allow user input when disabled is true", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Input label="Name" onChange={handleChange} disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
      await user.type(input, "John");
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("does not allow user input to exceed maxLength", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Input label="Name" onChange={handleChange} maxLength={5} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "Jonathan");
      expect(handleChange).toHaveBeenCalledTimes(5); // Only first 5 characters accepted
      expect(input).toHaveValue("Jonat");
    });

    it("allow users to input foreign characters", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Input label="Name" onChange={handleChange} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "输入Киирии");
      expect(handleChange).toHaveBeenCalledTimes(8); 
      expect(input).toHaveValue("输入Киирии");
    });

  });

  describe("Props Handling", () => {
    it("passes the maxLength prop to the input", () => {
      render(<Input label="Test Label" maxLength={10} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("maxLength", "10");
    });

    it("applies custom width when provided", () => {
      render(<Input label="Test Label" width="w-1/2" />);
      const container = screen.getByRole("textbox").parentElement;
      expect(container).toHaveClass("w-1/2");
    });

    it("sets the input type correctly", () => {
      render(<Input id="password" label="Password" type="password" required={false} />);
      const input = screen.getByLabelText("Password");
      expect(input).toHaveAttribute("type", "password");
    });

    it("sets the input id and name attributes", () => {
      render(<Input label="Email" id="email-input" name="email" />);
      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("id", "email-input");
      expect(input).toHaveAttribute("name", "email");
    });

  });
});
