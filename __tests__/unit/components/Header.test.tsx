import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/layout/Header";

describe("Header Component", () => {
  const mockOnMenuClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("displays the menu button (logo/title may be desktop-only)", () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    // Header should have a menu button (logo/title might be hidden on mobile in tests)
    const menuButton = screen.getByRole("button");
    expect(menuButton).toBeInTheDocument();
  });

  it("has a working menu button that calls onMenuClick", () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    const menuButton = screen.getByRole("button");
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
  });

  it("is accessible with proper ARIA attributes", () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    const header = screen.getByRole("banner");
    const menuButton = screen.getByRole("button");

    expect(header).toBeInTheDocument();
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-label");
  });
});
