import { render, screen, fireEvent } from "@testing-library/react";
import Input from "@/components/general/Input";

describe("Input Component", () => {
  it("renders correctly", () => {
    render(<Input label="Test Label" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("passes the maxLength prop to the input", () => {
    render(<Input label="Test Label" maxLength={10} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("limits input manually if implemented", () => {
    render(<Input label="Test Label" maxLength={5} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "123456" } });
    expect((input as HTMLInputElement).value.length).toBeLessThanOrEqual(5);
  });
});
