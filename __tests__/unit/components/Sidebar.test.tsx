import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "@/components/layout/Sidebar";
import * as nextNav from "next/navigation";

// Prepare router spies used by next/link and next/navigation mocks
const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: jest.fn(),
    usePathname: jest.fn(),
  };
});

// Mock next/link to call pushMock when clicked (keeps testable navigation)
jest.mock("next/link", () => {
  type NextLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: React.ReactNode;
  };

  const Component = (props: NextLinkProps) => {
    const { href, children, ...rest } = props;
    // Extract any onClick provided by the real component so we can call it as well
    const { onClick, ...other } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    };
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      // call the original onClick from the component (e.g. setIsOpen)
      try {
        if (typeof onClick === "function") onClick(e);
      } catch (err) {
        /* ignore */
      }
      if (typeof pushMock === "function") pushMock(href);
    };
    return (
      <a href={href} onClick={handleClick} {...other}>
        {children}
      </a>
    );
  };
  Component.displayName = "NextLinkMock";
  return { __esModule: true, default: Component };
});

// Mock auth hooks used by Sidebar
jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "ther-1", email: "ther@example.com" } }),
}));

jest.mock("@/app/hooks/useTherapistProfile", () => ({
  useTherapistProfile: () => ({ therapist: { id: "ther-1", name: "Dr. Mock", picture: "" }, isLoading: false }),
}));

// Mock signOut action
const signOutMock = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/actions/auth", () => ({ signOut: () => signOutMock() }));

describe("Sidebar component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (nextNav.useRouter as jest.Mock).mockReturnValue({ push: pushMock, refresh: refreshMock });
    (nextNav.usePathname as jest.Mock).mockReturnValue("/search");
  });

  describe("Rendering", () => {
    it("shows navigation heading, links and user info", () => {
      const setIsOpen = jest.fn();
      render(<Sidebar isOpen={true} setIsOpen={setIsOpen} />);

      expect(screen.getByText(/navigation/i)).toBeInTheDocument();
      expect(screen.getByText(/search/i)).toBeInTheDocument();
      expect(screen.getByText(/create report/i)).toBeInTheDocument();
      expect(screen.getByText(/ai mode/i)).toBeInTheDocument();
      expect(screen.getByText(/profile/i)).toBeInTheDocument();

      // Profile info (from mocked hook)
      expect(screen.getAllByText("Dr. Mock")[0]).toBeInTheDocument();
      expect(screen.getAllByText("ther@example.com")[0]).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("calls setIsOpen(false) when a navigation link is clicked", async () => {
      const setIsOpen = jest.fn();
      render(<Sidebar isOpen={true} setIsOpen={setIsOpen} />);

      const searchLink = screen.getByText(/search/i).closest("a");
      expect(searchLink).toBeTruthy();

      // clicking should trigger our next/link mock which calls pushMock
      fireEvent.click(searchLink!);
      expect(pushMock).toHaveBeenCalledWith("/search");

      // Sidebar Link onClick also calls setIsOpen(false)
      expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("toggles dropdown and performs logout flow", async () => {
      const setIsOpen = jest.fn();
      render(<Sidebar isOpen={true} setIsOpen={setIsOpen} />);

      // Click the desktop profile area to open dropdown. The component renders
      // both a mobile and a desktop profile name, so use getAllByText and
      // prefer the second occurrence (desktop) if available.
      const profileLabels = screen.getAllByText("Dr. Mock");
      const profileLabel = profileLabels.length > 1 ? profileLabels[1] : profileLabels[0];
      expect(profileLabel).toBeInTheDocument();

      await userEvent.click(profileLabel);

      // Dropdown items should appear
      expect(screen.getByText(/view/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();

      // Click logout and ensure signOut and navigation occurred
      await userEvent.click(screen.getByText(/logout/i));

      // signOut action should have been invoked
      expect(signOutMock).toHaveBeenCalled();

      // router.push to login and router.refresh should be called
      expect(pushMock).toHaveBeenCalledWith("/login");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  describe("Props Handling", () => {
    it("applies translate classes based on isOpen prop", () => {
      const setIsOpen = jest.fn();
      const { container, rerender } = render(<Sidebar isOpen={false} setIsOpen={setIsOpen} />);
      const aside = container.querySelector("aside");
      expect(aside).toBeTruthy();
      // closed sidebar should include -translate-x-full
      expect(aside!.className).toContain("-translate-x-full");

      // open sidebar
      rerender(<Sidebar isOpen={true} setIsOpen={setIsOpen} />);
      expect(aside!.className).toContain("translate-x-0");
    });

    it("marks the active navigation item based on pathname", () => {
      // set pathname to reports/new so Create Report becomes active
      (nextNav.usePathname as jest.Mock).mockReturnValue("/reports/new");
      const setIsOpen = jest.fn();
      const { container } = render(<Sidebar isOpen={true} setIsOpen={setIsOpen} />);

      // Find the link that contains 'Create Report' and assert it has the active class
      const createLink = screen.getByText(/create report/i).closest("a");
      expect(createLink).toBeTruthy();
      expect(createLink!.className).toContain("bg-secondary/30");
    });
  });
});
