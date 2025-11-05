import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/layout/Header";

describe("Header Component", () => {
  const mockOnMenuClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();
    });

    it("displays the menu button", () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      // Header should have a menu button 
      const menuButton = screen.getByRole("button");
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("has a working menu button that calls onMenuClick", () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      const menuButton = screen.getByRole("button");
      expect(menuButton).toBeInTheDocument();

      fireEvent.click(menuButton);
      expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
    });
  });

});
