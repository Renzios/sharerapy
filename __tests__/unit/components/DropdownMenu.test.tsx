import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DropdownMenu from "../../../components/general/DropdownMenu";

describe("DropdownMenu Component", () => {
  const makeItems = (onClick = jest.fn()) => [
    { label: "First", onClick },
    { label: "Second", onClick },
    { label: "Third", onClick, variant: "danger" as const },
  ];

  describe("Rendering", () => {
    it("renders nothing when isOpen is false", () => {
      const { container } = render(
        <DropdownMenu isOpen={false} onClose={jest.fn()} items={makeItems()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders menu items when isOpen is true", () => {
      render(<DropdownMenu isOpen={true} onClose={jest.fn()} items={makeItems()} />);
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });

    it("renders empty container when items array is empty", () => {
      const { container } = render(
        <DropdownMenu isOpen={true} onClose={jest.fn()} items={[]} />
      );
      // The dropdown root exists but contains no buttons
      const root = container.firstChild as HTMLElement;
      expect(root).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /first/i })).not.toBeInTheDocument();
    });

    it("supports non-latin characters in item labels", () => {
        render(
            <DropdownMenu isOpen={true} onClose={jest.fn()} items={[
                    { label: "第一", onClick: jest.fn() }, 
                    { label: "русский", onClick: jest.fn() }, 
                    { label: "안녕", onClick: jest.fn() }
                ]} />
        );
        expect(screen.getByText("第一")).toBeInTheDocument();
        expect(screen.getByText("русский")).toBeInTheDocument();
        expect(screen.getByText("안녕")).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("calls item.onClick and onClose when an item is clicked", async () => {
      const itemClick = jest.fn();
      const onClose = jest.fn();
      render(<DropdownMenu isOpen={true} onClose={onClose} items={makeItems(itemClick)} />);
      const user = userEvent.setup();
      await user.click(screen.getByText("Second"));
      expect(itemClick).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking outside the dropdown", () => {
      const onClose = jest.fn();
      render(<DropdownMenu isOpen={true} onClose={onClose} items={makeItems()} />);
      // simulate mousedown outside
      fireEvent.mouseDown(document.body);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
