import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmationModal from "@/components/general/ConfirmationModal";

// Mock Button component
jest.mock("@/components/general/Button", () => {
  return function MockButton({
    children,
    onClick,
    disabled,
    variant,
    id,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    id?: string;
  }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        id={id}
        data-testid={variant === "outline" ? "cancel-button" : "confirm-button"}
      >
        {children}
      </button>
    );
  };
});

describe("ConfirmationModal Component", () => {
  const defaultProps = {
    isOpen: true,
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("displays title and message when open", () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByRole("heading", { level: 2, name: "Confirm Action" })).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      render(<ConfirmationModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
      expect(screen.queryByText("Are you sure you want to proceed?")).not.toBeInTheDocument();
    });

    it("renders default confirm and cancel button text", () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByText("Confirm")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("renders custom confirm and cancel button text", () => {
      render(
        <ConfirmationModal
          {...defaultProps}
          confirmText="Delete"
          cancelText="Go Back"
        />
      );

      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });

    it("supports non-latin characters in title", () => {
      render(
        <ConfirmationModal
          {...defaultProps}
          title="确认操作"
          message="你确定要继续吗？"
        />
      );

      expect(screen.getByRole("heading", { level: 2, name: "确认操作" })).toBeInTheDocument();
      expect(screen.getByText("你确定要继续吗？")).toBeInTheDocument();
    });

    it("supports non-latin characters in message", () => {
      render(
        <ConfirmationModal
          {...defaultProps}
          title="Подтверждение"
          message="Вы уверены, что хотите продолжить?"
        />
      );

      expect(screen.getByRole("heading", { level: 2, name: "Подтверждение" })).toBeInTheDocument();
      expect(screen.getByText("Вы уверены, что хотите продолжить?")).toBeInTheDocument();
    });


    it("renders buttons in correct order (cancel then confirm)", () => {
      render(<ConfirmationModal {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveTextContent("Cancel");
      expect(buttons[1]).toHaveTextContent("Confirm");
    });

    it("handles empty title gracefully", () => {
      render(<ConfirmationModal {...defaultProps} title="" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("");
    });

    it("handles empty message gracefully", () => {
      render(<ConfirmationModal {...defaultProps} message="" />);

      const message = screen.getByText("", { selector: "p" });
      expect(message).toBeInTheDocument();
    });

    it("handles very long title text", () => {
      const longTitle = "A".repeat(100);
      render(<ConfirmationModal {...defaultProps} title={longTitle} />);

      expect(screen.getByRole("heading", { level: 2, name: longTitle })).toBeInTheDocument();
    });

    it("handles very long message text", () => {
      const longMessage = "B".repeat(500);
      render(<ConfirmationModal {...defaultProps} message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("renders with loading state without visual changes", () => {
      render(<ConfirmationModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole("heading", { level: 2, name: "Confirm Action" })).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("calls onConfirm when confirm button is clicked", async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByText("Confirm"));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);

      await user.click(screen.getByText("Cancel"));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when backdrop is clicked", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(
        <ConfirmationModal {...defaultProps} onCancel={onCancel} />
      );

      // The backdrop is rendered via portal to document.body
      const backdrop = document.body.querySelector(".fixed.inset-0 > .absolute.inset-0") as HTMLElement;
      expect(backdrop).toBeInTheDocument();
      await user.click(backdrop);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("does not call onConfirm when confirm button is clicked while loading", async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      render(
        <ConfirmationModal
          {...defaultProps}
          onConfirm={onConfirm}
          isLoading={true}
        />
      );

      const confirmButton = screen.getByTestId("confirm-button");
      await user.click(confirmButton);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("does not call onCancel when cancel button is clicked while loading", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(
        <ConfirmationModal
          {...defaultProps}
          onCancel={onCancel}
          isLoading={true}
        />
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await user.click(cancelButton);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("disables both buttons when isLoading is true", () => {
      render(<ConfirmationModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByTestId("cancel-button");
      const confirmButton = screen.getByTestId("confirm-button");

      expect(cancelButton).toBeDisabled();
      expect(confirmButton).toBeDisabled();
    });

    it("enables both buttons when isLoading is false", () => {
      render(<ConfirmationModal {...defaultProps} isLoading={false} />);

      const cancelButton = screen.getByTestId("cancel-button");
      const confirmButton = screen.getByTestId("confirm-button");

      expect(cancelButton).not.toBeDisabled();
      expect(confirmButton).not.toBeDisabled();
    });

    it("buttons are keyboard accessible", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      const onConfirm = jest.fn();
      render(
        <ConfirmationModal
          {...defaultProps}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      );

      // Tab to cancel button
      await user.tab();
      const cancelButton = screen.getByTestId("cancel-button");
      expect(cancelButton).toHaveFocus();

      // Press Enter on cancel button
      await user.keyboard("{Enter}");
      expect(onCancel).toHaveBeenCalledTimes(1);

      // Tab to confirm button
      await user.tab();
      const confirmButton = screen.getByTestId("confirm-button");
      expect(confirmButton).toHaveFocus();

      // Press Enter on confirm button
      await user.keyboard("{Enter}");
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not close modal when clicking inside modal content", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);

      const title = screen.getByRole("heading", { level: 2 });
      await user.click(title);

      expect(onCancel).not.toHaveBeenCalled();
    });

    it("does not propagate clicks from modal content to backdrop", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      const { container } = render(
        <ConfirmationModal {...defaultProps} onCancel={onCancel} />
      );

      const modal = container.querySelector(".bg-white") as HTMLElement;
      await user.click(modal);

      expect(onCancel).not.toHaveBeenCalled();
    });

    it("handles rapid clicking on confirm button", async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByText("Confirm");
      await user.click(confirmButton);
      await user.click(confirmButton);
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(3);
    });

    it("handles rapid clicking on cancel button", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);
      await user.click(cancelButton);
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(3);
    });

    it("supports hover interaction on buttons", async () => {
      const user = userEvent.setup();
      render(<ConfirmationModal {...defaultProps} />);

      const confirmButton = screen.getByText("Confirm");
      await user.hover(confirmButton);

      expect(confirmButton).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("applies confirmButtonID to confirm button", () => {
      render(
        <ConfirmationModal {...defaultProps} confirmButtonID="confirm-delete" />
      );

      const confirmButton = screen.getByTestId("confirm-button");
      expect(confirmButton).toHaveAttribute("id", "confirm-delete");
    });

    it("applies cancelButtonID to cancel button", () => {
      render(
        <ConfirmationModal {...defaultProps} cancelButtonID="cancel-action" />
      );

      const cancelButton = screen.getByTestId("cancel-button");
      expect(cancelButton).toHaveAttribute("id", "cancel-action");
    });

    it("handles isLoading prop defaulting to false", () => {
      render(<ConfirmationModal {...defaultProps} />);

      const confirmButton = screen.getByTestId("confirm-button");
      const cancelButton = screen.getByTestId("cancel-button");

      expect(confirmButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
    });

    it("handles confirmText prop defaulting to 'Confirm'", () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });

    it("handles cancelText prop defaulting to 'Cancel'", () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("handles changing isOpen from false to true", () => {
      const { rerender } = render(
        <ConfirmationModal {...defaultProps} isOpen={false} />
      );

      expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();

      rerender(<ConfirmationModal {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("heading", { level: 2, name: "Confirm Action" })).toBeInTheDocument();
    });

    it("handles changing isOpen from true to false", () => {
      const { rerender } = render(
        <ConfirmationModal {...defaultProps} isOpen={true} />
      );

      expect(screen.getByRole("heading", { level: 2, name: "Confirm Action" })).toBeInTheDocument();

      rerender(<ConfirmationModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    });

    it("transitions between loading states correctly", () => {
      const { rerender } = render(
        <ConfirmationModal {...defaultProps} isLoading={false} />
      );

      let confirmButton = screen.getByTestId("confirm-button");
      expect(confirmButton).not.toBeDisabled();

      rerender(<ConfirmationModal {...defaultProps} isLoading={true} />);

      confirmButton = screen.getByTestId("confirm-button");
      expect(confirmButton).toBeDisabled();

      rerender(<ConfirmationModal {...defaultProps} isLoading={false} />);

      confirmButton = screen.getByTestId("confirm-button");
      expect(confirmButton).not.toBeDisabled();
    });
  });
});
