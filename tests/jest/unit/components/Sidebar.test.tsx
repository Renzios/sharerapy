import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { User } from "@supabase/supabase-js";

// Mock Next.js navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockUsePathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

// Mock auth actions
const mockSignOut = jest.fn();
jest.mock("@/lib/actions/auth", () => ({
  signOut: () => mockSignOut(),
}));

// Mock storage utils
jest.mock("@/lib/utils/storage", () => ({
  getPublicURL: (bucket: string, path: string) => `https://cdn.test/${bucket}/${path}`,
}));

// Mock Auth Context
const mockUseAuth = jest.fn();
jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Therapist Profile Context
const mockUseTherapistProfile = jest.fn();
jest.mock("@/app/contexts/TherapistProfileContext", () => ({
  useTherapistProfile: () => mockUseTherapistProfile(),
}));

import Sidebar from "@/components/layout/Sidebar";

const testUser: User = {
  id: "test-therapist-1",
  email: "dawson@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00Z",
};

const testTherapist = {
  id: "test-therapist-1",
  name: "Dawson Catignas",
  email: "dawson@example.com",
  picture: "profile.jpg",
  clinic_id: "clinic-1",
  languages: ["English"],
  created_at: "2024-01-01T00:00:00Z",
};

describe("Sidebar Component", () => {
  const mockSetIsOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
    mockUseAuth.mockReturnValue({
      user: testUser,
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseTherapistProfile.mockReturnValue({
      therapist: testTherapist,
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  describe("Rendering", () => {
    it("displays the Sharerapy logo and branding", () => {
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const logos = screen.getAllByAltText("Sharerapy Logo");
      const brandingShare = screen.getAllByText("share", { exact: false });
      const brandingRapy = screen.getAllByText("rapy.", { exact: false });

      expect(logos.length).toBeGreaterThan(0);
      expect(brandingShare.length).toBeGreaterThan(0);
      expect(brandingRapy.length).toBeGreaterThan(0);
    });

    it("renders all navigation links", () => {
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const searchLink = screen.getByRole("link", { name: /search/i });
      const patientsLink = screen.getByRole("link", { name: /patients/i });
      const reportsLink = screen.getByRole("link", { name: /reports/i });
      const therapistsLink = screen.getByRole("link", { name: /therapists/i });
      const createLink = screen.getByRole("link", { name: /create report/i });
      const aiLink = screen.getByRole("link", { name: /ai mode/i });
      const profileLink = screen.getByRole("link", { name: /profile/i });

      expect(searchLink).toBeInTheDocument();
      expect(patientsLink).toBeInTheDocument();
      expect(reportsLink).toBeInTheDocument();
      expect(therapistsLink).toBeInTheDocument();
      expect(createLink).toBeInTheDocument();
      expect(aiLink).toBeInTheDocument();
      expect(profileLink).toBeInTheDocument();
    });

    it("displays user profile information", () => {
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const profileImages = screen.getAllByAltText("Profile Picture");
      const userName = screen.getAllByText(/dawson catignas/i);

      expect(profileImages.length).toBeGreaterThan(0);
      expect(userName.length).toBeGreaterThan(0);
    });

    it("renders consistently across different states", () => {
      const { rerender } = render(
        <Sidebar isOpen={false} setIsOpen={mockSetIsOpen} />
      );

      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toBeInTheDocument();

      rerender(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);
      expect(sidebar).toBeInTheDocument();
    });

    it("supports non-latin characters in user name", () => {
      mockUseTherapistProfile.mockReturnValue({
        therapist: { ...testTherapist, name: "张伟" },
        isLoading: false,
        refetch: jest.fn(),
      });

      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const userName = screen.getAllByText("张伟");
      expect(userName.length).toBeGreaterThan(0);
    });

    it("displays default profile picture when therapist has no picture", () => {
      mockUseTherapistProfile.mockReturnValue({
        therapist: { ...testTherapist, picture: null },
        isLoading: false,
        refetch: jest.fn(),
      });

      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const profileImages = screen.getAllByAltText("Profile Picture");
      expect(profileImages[0]).toHaveAttribute("src", "/testpfp.jpg");
    });

    it("shows User when therapist name is not available", () => {
      mockUseTherapistProfile.mockReturnValue({
        therapist: null,
        isLoading: false,
        refetch: jest.fn(),
      });

      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const userLabels = screen.getAllByText("User");
      expect(userLabels.length).toBeGreaterThan(0);
    });
  });

  describe("Prop Handling", () => {
    it("has navigation links that have correct href attributes", () => {
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const searchLink = screen.getByRole("link", { name: /^search$/i });
      const patientsLink = screen.getByRole("link", { name: /patients/i });
      const reportsLink = screen.getByRole("link", { name: /^reports$/i });
      const therapistsLink = screen.getByRole("link", { name: /therapists/i });
      const createLink = screen.getByRole("link", { name: /create report/i });
      const aiLink = screen.getByRole("link", { name: /ai mode/i });
      const profileLink = screen.getByRole("link", { name: /profile/i });

      expect(searchLink).toHaveAttribute("href", "/");
      expect(patientsLink).toHaveAttribute("href", "/search/patients");
      expect(reportsLink).toHaveAttribute("href", "/search/reports");
      expect(therapistsLink).toHaveAttribute("href", "/search/therapists");
      expect(createLink).toHaveAttribute("href", "/reports/new");
      expect(aiLink).toHaveAttribute("href", "/ai-mode");
      expect(profileLink).toHaveAttribute("href", `/profile/therapist/${testUser.id}`);
    });

    it("applies active styling to current route", () => {
      mockUsePathname.mockReturnValue("/reports/new");
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const createLink = screen.getByRole("link", { name: /create report/i });
      expect(createLink).toHaveClass("bg-secondary/30");
    });
  });

  describe("User Interaction", () => {
    it("calls setIsOpen(false) when navigation links are clicked", async () => {
      const user = userEvent.setup();
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const searchLink = screen.getByRole("link", { name: /^search$/i });
      await user.click(searchLink);

      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it("toggles dropdown menu when profile section is clicked", async () => {
      const user = userEvent.setup();
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      // Find the dropdown button by id
      const dropdownBtn = document.querySelector("#sidebar-profile-dropdown-btn");
      expect(dropdownBtn).toBeInTheDocument();

      // Click to open dropdown
      await user.click(dropdownBtn!);

      // Check dropdown menu items appear (use getAllByRole since there might be multiple instances)
      const viewButtons = screen.getAllByRole("button", { name: /view/i });
      const logoutButtons = screen.getAllByRole("button", { name: /logout/i });

      expect(viewButtons.length).toBeGreaterThan(0);
      expect(logoutButtons.length).toBeGreaterThan(0);
    });

    it("calls signOut and navigates on logout", async () => {
      const user = userEvent.setup();
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      // Open dropdown
      const dropdownBtn = document.querySelector("#sidebar-profile-dropdown-btn");
      await user.click(dropdownBtn!);

      // Click logout (use getAllByRole and select first one)
      const logoutButtons = screen.getAllByRole("button", { name: /logout/i });
      await user.click(logoutButtons[0]);

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
