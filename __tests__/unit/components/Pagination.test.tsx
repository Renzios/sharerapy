import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "@/components/general/Pagination";

describe("Pagination Component", () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("renders previous and next navigation buttons", () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
      
      const buttons = screen.getAllByRole("button");
      // Should have prev button + page buttons + next button
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    describe("Page Number Display", () => {
      it("displays all page numbers when totalPages <= 5", () => {
        render(<Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />);
        
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
      });

      it("displays exactly 5 page numbers when totalPages > 5", () => {
        render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
        
        const buttons = screen.getAllByRole("button");
        // 2 navigation buttons + 5 page buttons = 7 total
        const pageButtons = buttons.filter(btn => 
          !btn.querySelector('svg') // Filter out buttons with icons (prev/next)
        );
        expect(pageButtons).toHaveLength(5);
      });

      it("shows pages 1-5 when on page 1 with 10 total pages", () => {
        render(<Pagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />);
        
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.queryByText("6")).not.toBeInTheDocument();
      });

      it("shows pages 3-7 when on page 5 with 10 total pages", () => {
        render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
        
        expect(screen.queryByText("2")).not.toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
        expect(screen.queryByText("8")).not.toBeInTheDocument();
      });

      it("shows pages 6-10 when on page 10 with 10 total pages", () => {
        render(<Pagination currentPage={10} totalPages={10} onPageChange={mockOnPageChange} />);
        
        expect(screen.queryByText("5")).not.toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
        expect(screen.getByText("8")).toBeInTheDocument();
        expect(screen.getByText("9")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
      });
    });

    describe("Page Edge Cases", () => {
      it("handles single page correctly", () => {
        render(<Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />);
        
        expect(screen.getByText("1")).toBeInTheDocument();
        
        const buttons = screen.getAllByRole("button");
        const prevButton = buttons[0];
        const nextButton = buttons[buttons.length - 1];
        
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeDisabled();
      });

      it("handles large page numbers correctly", () => {
        render(<Pagination currentPage={50} totalPages={100} onPageChange={mockOnPageChange} />);
        
        expect(screen.getByText("48")).toBeInTheDocument();
        expect(screen.getByText("49")).toBeInTheDocument();
        expect(screen.getByText("50")).toBeInTheDocument();
        expect(screen.getByText("51")).toBeInTheDocument();
        expect(screen.getByText("52")).toBeInTheDocument();
      });
    });

    describe("Page Highlighting", () => {
      it("highlights the current page with primary background", () => {
        render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
        
        const page3Button = screen.getByText("3");
        expect(page3Button).toHaveClass("bg-primary", "text-white");
      });

      it("does not highlight other pages", () => {
        render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
        
        const page2Button = screen.getByText("2");
        expect(page2Button).toHaveClass("border", "border-bordergray", "bg-white");
        expect(page2Button).not.toHaveClass("bg-primary");
      });
    });

  });

  describe("User Interactions", () => {
    describe("Navigation Buttons Click", () => {
      it("calls onPageChange with previous page when previous button clicked", async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
        
        const buttons = screen.getAllByRole("button");
        const prevButton = buttons[0]; // First button is previous
        
        await user.click(prevButton);
        
        expect(mockOnPageChange).toHaveBeenCalledWith(2);
      });

      it("calls onPageChange with next page when next button clicked", async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
        
        const buttons = screen.getAllByRole("button");
        const nextButton = buttons[buttons.length - 1]; // Last button is next
        
        await user.click(nextButton);
        
        expect(mockOnPageChange).toHaveBeenCalledWith(4);
      });

      it("calls onPageChange with correct page number when page button clicked", async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
        
        const page4Button = screen.getByText("4");
        await user.click(page4Button);
        
        expect(mockOnPageChange).toHaveBeenCalledWith(4);
      });
    });

    describe("Page Number Buttons Click", () => {
      it("calls onPageChange with correct page number when page button clicked", async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
        const page4Button = screen.getByText("4");
        await user.click(page4Button);
        expect(mockOnPageChange).toHaveBeenCalledWith(4);
      });
    });

    describe("Navigation Buttons Click", () => {
      it("calls onPageChange with previous page when previous button clicked", async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
        const buttons = screen.getAllByRole("button");
        const prevButton = buttons[0]; // First button is previous
        await user.click(prevButton);
        expect(mockOnPageChange).toHaveBeenCalledWith(2);
      });

      it("calls onPageChange with next page when next button clicked", async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
        const buttons = screen.getAllByRole("button");
        const nextButton = buttons[buttons.length - 1];
        await user.click(nextButton);
        expect(mockOnPageChange).toHaveBeenCalledWith(4);
      });
    });

    describe("Disabled Buttons Click", () => {
      it("does not call onPageChange when previous button is disabled", async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
        const buttons = screen.getAllByRole("button");
        const prevButton = buttons[0];
        await user.click(prevButton);

        // onPageChange should not be called since prev is disabled
        expect(mockOnPageChange).not.toHaveBeenCalled();
      });

      it("does not call onPageChange when next button is disabled", async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);
        const buttons = screen.getAllByRole("button");
        const nextButton = buttons[buttons.length - 1];
        await user.click(nextButton);

        // onPageChange should not be called since next is disabled
        expect(mockOnPageChange).not.toHaveBeenCalled();
      });
    });
  });

  describe("Props Handling", () => {
   it("correctly assigns totalPages and currentPage props", () => {
      const currentPage = 4;
      const totalPages = 10;
      render(<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={mockOnPageChange} />);

      // totalPages: no page button should show a number > totalPages
      const numericButtons = screen
        .getAllByRole("button")
        .filter((btn) => /^\d+$/.test((btn.textContent || "").trim()));

      // Should not render more numeric page buttons than the component's max window or totalPages
      expect(numericButtons.length).toBeLessThanOrEqual(Math.min(totalPages, 5));

      numericButtons.forEach((btn) => {
        const pageNum = Number((btn.textContent || "").trim());
        expect(pageNum).toBeGreaterThanOrEqual(1);
        expect(pageNum).toBeLessThanOrEqual(totalPages);
      });
    });

    it("assigns isPending prop correctly to disable buttons", () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} isPending={true} />);
      // While isPending is true, all buttons should be disabled
      const buttons = screen.getAllByRole("button");
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });
  
});

