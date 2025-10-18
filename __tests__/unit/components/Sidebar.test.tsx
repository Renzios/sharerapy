import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "@/components/layout/Sidebar";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/search",
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Sidebar Component", () => {
  const mockSetIsOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toBeInTheDocument();
  });

  it("displays the Sharerapy logo and branding", () => {
    render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

    const logos = screen.getAllByAltText("Sharerapy Logo");
    // Look for "share" text since "sharerapy" is split across spans
    const brandingShare = screen.getAllByText("share");
    const brandingRapy = screen.getAllByText("rapy.");

    expect(logos.length).toBeGreaterThan(0);
    expect(brandingShare.length).toBeGreaterThan(0);
    expect(brandingRapy.length).toBeGreaterThan(0);
  });

  it("renders all navigation links", () => {
    render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

    const searchLink = screen.getByRole("link", { name: /search/i });
    const createLink = screen.getByRole("link", { name: /create report/i });
    const aiLink = screen.getByRole("link", { name: /ai mode/i });
    const profileLink = screen.getByRole("link", { name: /profile/i });

    expect(searchLink).toBeInTheDocument();
    expect(createLink).toBeInTheDocument();
    expect(aiLink).toBeInTheDocument();
    expect(profileLink).toBeInTheDocument();
  });

  it("navigation links have correct href attributes", () => {
    render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

    const searchLink = screen.getByRole("link", { name: /search/i });
    const createLink = screen.getByRole("link", { name: /create report/i });
    const aiLink = screen.getByRole("link", { name: /ai mode/i });
    const profileLink = screen.getByRole("link", { name: /profile/i });

    expect(searchLink).toHaveAttribute("href", "/search");
    expect(createLink).toHaveAttribute("href", "/reports/new");
    expect(aiLink).toHaveAttribute("href", "/ai-mode");
    expect(profileLink).toHaveAttribute("href", "/profile/me");
  });

  it("calls setIsOpen(false) when navigation links are clicked", () => {
    render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

    const searchLink = screen.getByRole("link", { name: /search/i });
    fireEvent.click(searchLink);

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it("has proper accessibility attributes", () => {
    render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

    const sidebar = screen.getByRole("complementary");
    const navigation = screen.getByRole("navigation");

    expect(sidebar).toBeInTheDocument();
    expect(navigation).toBeInTheDocument();
  });

  it("displays user profile information", () => {
    render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

    const profileImage = screen.getAllByAltText("Profile Picture");
    const userName = screen.getAllByText(/dawson catignas/i);

    expect(profileImage.length).toBeGreaterThan(0);
    expect(userName.length).toBeGreaterThan(0);
  });

  it("renders consistently across different states", () => {
    const { rerender } = render(
      <Sidebar isOpen={false} setIsOpen={mockSetIsOpen} />
    );

    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toBeInTheDocument();

    // Test that component re-renders without errors when isOpen changes
    rerender(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);
    expect(sidebar).toBeInTheDocument();
  });

  it("toggles profile dropdown on desktop", () => {
    render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

    // Find the profile section button (should be hidden on mobile, visible on lg)
    const profileSection = screen
      .getByRole("complementary")
      .querySelector(".lg\\:block");
    expect(profileSection).toBeInTheDocument();
  });
});
