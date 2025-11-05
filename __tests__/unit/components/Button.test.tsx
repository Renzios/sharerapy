import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../../../components/general/Button";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("renders button label", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
    });

    it("supports foreign characters", () => {
      render(<Button>点击我</Button>);
      expect(screen.getByRole("button", { name: "点击我" })).toBeInTheDocument();

      render(<Button>Тимэх</Button>);
      expect(screen.getByRole("button", { name: "Тимэх" })).toBeInTheDocument();

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
    it("calls onClick when clicked", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click</Button>);
      await user.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(
        <Button disabled onClick={onClick}>
          Disabled Click
        </Button>
      );
      await user.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("is focusable", async () => {
      const user = userEvent.setup();
      render(<Button>Focusable</Button>);
      const btn = screen.getByRole("button");
      await user.tab();
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