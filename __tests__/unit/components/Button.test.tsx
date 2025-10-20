import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../../../components/general/Button";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("renders with text children", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
    });

    it("applies custom width/height inline styles", () => {
      render(
        <Button width="200px" height="48px">
          Custom Size
        </Button>
      );
      const btn = screen.getByRole("button");
      expect(btn).toHaveStyle({ width: "200px", height: "48px" });
    });

    it("renders disabled attribute and related classes are present on component", () => {
      render(<Button disabled>Disabled</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      expect(btn).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
    });

    it("renders styling props correctly", () => {
      render(
        <Button variant="outline" shape="pill" width="full" fontSize="text-lg">
          Styled Button
        </Button>
      );
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass(
        "bg-transparent",
        "border-primary",
        "text-primary",
        "rounded-full",
        "w-full",
        "text-lg"
      );
    });
  });

  describe("User Interaction", () => {
    it("calls onClick when clicked", () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", () => {
      const onClick = jest.fn();
      render(
        <Button disabled onClick={onClick}>
          Disabled Click
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("is focusable", () => {
      render(<Button>Focusable</Button>);
      const btn = screen.getByRole("button");
      btn.focus();
      expect(btn).toHaveFocus();
    });
  });

  describe("Props Handling", () => {
    it("uses type='button' by default", () => {
      render(<Button>Default Type</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("supports type='submit'", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("supports type='reset'", () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "reset");
    });

    it("applies additional className prop", () => {
      render(<Button className="custom-class">With Class</Button>);
      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });

  });
});