import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TherapistProfile from "@/components/layout/TherapistProfile";
import type { Tables } from "@/lib/types/database.types";

// Mock next/navigation hooks
const mockPush = jest.fn();
const mockHandleBackClick = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/search/therapists",
}));

jest.mock("@/app/hooks/useBackNavigation", () => ({
  useBackNavigation: () => ({ handleBackClick: mockHandleBackClick }),
}));

// Mock TherapistProfileContext
const mockUseTherapistProfile = jest.fn();
jest.mock("@/app/contexts/TherapistProfileContext", () => ({
  useTherapistProfile: () => mockUseTherapistProfile(),
}));

// Mock utility functions
jest.mock("@/lib/utils/storage", () => ({
  getPublicURL: (bucket: string, path: string) => `https://mock-url.com/${bucket}/${path}`,
}));

jest.mock("@/lib/utils/frontendHelpers", () => ({
  formatDate: (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },
}));

// Mock Next Image
jest.mock("next/image", () => {
  const ImageMock = (props: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }) => {
    const { src, alt, className } = props;
    return <img src={src} alt={alt} className={className} />;
  };
  ImageMock.displayName = "NextImageMock";
  return { __esModule: true, default: ImageMock };
});

// Mock Button component
type ButtonProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  className?: string;
  disabled?: boolean;
};

jest.mock("@/components/general/Button", () => {
  const ButtonMock = (props: ButtonProps) => {
    const { children, onClick, variant, className, disabled } = props;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        className={className}
      >
        {children}
      </button>
    );
  };
  ButtonMock.displayName = "ButtonMock";
  return { __esModule: true, default: ButtonMock };
});

// Type definitions for test data
type TherapistRelation = Tables<"therapists"> & {
  clinic: Tables<"clinics"> & {
    country: Tables<"countries">;
  };
};

// Helper function to create mock therapist data
const createMockTherapist = (overrides?: Partial<TherapistRelation>): TherapistRelation => ({
  id: "therapist-123",
  name: "Dr. Jane Smith",
  first_name: "Jane",
  last_name: "Smith",
  bio: "Experienced therapist specializing in cognitive behavioral therapy.",
  picture: "therapist-picture.jpg",
  age: 35,
  clinic_id: 1,
  created_at: "2024-01-15T00:00:00Z",
  updated_at: "2024-01-15T00:00:00Z",
  clinic: {
    id: 1,
    clinic: "Wellness Center",
    country_id: 1,
    country: {
      id: 1,
      country: "United States",
    },
  },
  ...overrides,
});

describe("TherapistProfile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTherapistProfile.mockReturnValue({ therapist: null });
  });

  describe("Rendering", () => {
    it("renders therapist name correctly", () => {
      const therapist = createMockTherapist({ name: "Dr. John Doe" });
      render(<TherapistProfile therapist={therapist} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Dr. John Doe");
    });

    it("renders therapist profile picture with correct attributes", () => {
      const therapist = createMockTherapist({ picture: "profile.jpg" });
      render(<TherapistProfile therapist={therapist} />);

      const image = screen.getByAltText("Therapist Profile Picture");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "https://mock-url.com/therapist_pictures/profile.jpg");
    });

    it("renders clinic name correctly", () => {
      const therapist = createMockTherapist({
        clinic: {
          id: 2,
          clinic: "Mental Health Clinic",
          country_id: 1,
          country: {
            id: 1,
            country: "United States",
          },
        },
      });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("Mental Health Clinic")).toBeInTheDocument();
    });

    it("renders bio in About Me section", () => {
      const therapist = createMockTherapist({
        bio: "Specialized in family therapy with 10 years of experience.",
      });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("About Me")).toBeInTheDocument();
      expect(screen.getByText("Specialized in family therapy with 10 years of experience.")).toBeInTheDocument();
    });

    it("renders country information correctly", () => {
      const therapist = createMockTherapist({
        clinic: {
          id: 1,
          clinic: "Wellness Center",
          country_id: 2,
          country: {
            id: 2,
            country: "Canada",
          },
        },
      });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("Country")).toBeInTheDocument();
      expect(screen.getByText("Canada")).toBeInTheDocument();
    });

    it("renders age with 'Years Old' suffix", () => {
      const therapist = createMockTherapist({ age: 42 });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("42 Years Old")).toBeInTheDocument();
    });

    it("renders formatted join date", () => {
      const therapist = createMockTherapist({ created_at: "2023-05-20T10:30:00Z" });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("Joined")).toBeInTheDocument();
      expect(screen.getByText("May 20, 2023")).toBeInTheDocument();
    });

    it("renders Back button", () => {
      const therapist = createMockTherapist();
      render(<TherapistProfile therapist={therapist} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAttribute("data-variant", "filled");
    });

    it("does not render Edit button when viewing another therapist's profile", () => {
      const therapist = createMockTherapist({ id: "therapist-123" });
      mockUseTherapistProfile.mockReturnValue({ therapist: { id: "therapist-456" } });
      render(<TherapistProfile therapist={therapist} />);

      const editButton = screen.queryByRole("button", { name: /edit/i });
      expect(editButton).not.toBeInTheDocument();
    });

    it("renders Edit button when viewing own profile", () => {
      const therapist = createMockTherapist({ id: "therapist-123" });
      mockUseTherapistProfile.mockReturnValue({ therapist: { id: "therapist-123" } });
      render(<TherapistProfile therapist={therapist} />);

      const editButton = screen.getByRole("button", { name: /edit/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveAttribute("data-variant", "outline");
    });

    it("renders all information sections", () => {
      const therapist = createMockTherapist();
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("About Me")).toBeInTheDocument();
      expect(screen.getByText("Country")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("Joined")).toBeInTheDocument();
    });

    it("renders both Edit and Back buttons when viewing own profile", () => {
      const therapist = createMockTherapist({ id: "therapist-123" });
      mockUseTherapistProfile.mockReturnValue({ therapist: { id: "therapist-123" } });
      render(<TherapistProfile therapist={therapist} />);

      const editButton = screen.getByRole("button", { name: /edit/i });
      const backButton = screen.getByRole("button", { name: /back/i });

      expect(editButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    it("handles therapist with special characters in name", () => {
      const therapist = createMockTherapist({ name: "Dr. José María O'Connor-Smith" });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("Dr. José María O'Connor-Smith")).toBeInTheDocument();
    });

    it("handles therapist with non-latin characters in name", () => {
      const therapist = createMockTherapist({ name: "Dr. 李明" });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("Dr. 李明")).toBeInTheDocument();
    });

    it("handles clinic with special characters", () => {
      const therapist = createMockTherapist({
        clinic: {
          id: 1,
          clinic: "L'Hôpital & Wellness Clinic",
          country_id: 1,
          country: {
            id: 1,
            country: "France",
          },
        },
      });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("L'Hôpital & Wellness Clinic")).toBeInTheDocument();
    });

    it("handles therapist with empty bio", () => {
      const therapist = createMockTherapist({ bio: "" });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText("About Me")).toBeInTheDocument();
      const bioSection = screen.getByText("About Me").closest("div");
      expect(bioSection).toBeInTheDocument();
    });

    it("handles therapist context returning null", () => {
      const therapist = createMockTherapist();
      mockUseTherapistProfile.mockReturnValue({ therapist: null });
      render(<TherapistProfile therapist={therapist} />);

      const editButton = screen.queryByRole("button", { name: /edit/i });
      expect(editButton).not.toBeInTheDocument();
    });

    it("handles therapist context returning undefined", () => {
      const therapist = createMockTherapist();
      mockUseTherapistProfile.mockReturnValue({ therapist: undefined });
      render(<TherapistProfile therapist={therapist} />);

      const editButton = screen.queryByRole("button", { name: /edit/i });
      expect(editButton).not.toBeInTheDocument();
    });

    it("handles therapist with very long bio", () => {
      const longBio = "A".repeat(500);
      const therapist = createMockTherapist({ bio: longBio });
      render(<TherapistProfile therapist={therapist} />);

      expect(screen.getByText(longBio)).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("calls handleBackClick when Back button is clicked", async () => {
      const therapist = createMockTherapist();
      render(<TherapistProfile therapist={therapist} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      await userEvent.click(backButton);

      expect(mockHandleBackClick).toHaveBeenCalledTimes(1);
    });

    it("navigates to edit page when Edit button is clicked", async () => {
      const therapist = createMockTherapist({ id: "therapist-789" });
      mockUseTherapistProfile.mockReturnValue({ therapist: { id: "therapist-789" } });
      render(<TherapistProfile therapist={therapist} />);

      const editButton = screen.getByRole("button", { name: /edit/i });
      await userEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/profile/therapist/therapist-789/edit");
    });

    it("handles multiple clicks on Back button", async () => {
      const therapist = createMockTherapist();
      render(<TherapistProfile therapist={therapist} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      
      await userEvent.click(backButton);
      await userEvent.click(backButton);
      await userEvent.click(backButton);

      expect(mockHandleBackClick).toHaveBeenCalledTimes(3);
    });

    it("handles Edit button click on own profile", async () => {
      const therapist = createMockTherapist({ id: "therapist-123" });
      mockUseTherapistProfile.mockReturnValue({ therapist: { id: "therapist-123" } });
      render(<TherapistProfile therapist={therapist} />);

      const editButton = screen.getByRole("button", { name: /edit/i });
      await userEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith("/profile/therapist/therapist-123/edit");
    });
  });

  describe("Props Handling", () => {
    it("handles therapist with empty picture string", () => {
      const therapist = createMockTherapist({ picture: "" });
      render(<TherapistProfile therapist={therapist} />);

      const image = screen.getByAltText("Therapist Profile Picture");
      expect(image).toHaveAttribute("src", "https://mock-url.com/therapist_pictures/");
    });

    it("handles therapist with null picture", () => {
      const therapist = createMockTherapist({ picture: null as unknown as string });
      render(<TherapistProfile therapist={therapist} />);

      const image = screen.getByAltText("Therapist Profile Picture");
      expect(image).toBeInTheDocument();
    });

    it("handles therapist with picture path containing special characters", () => {
      const therapist = createMockTherapist({ picture: "folder/sub-folder/image_name-123.jpg" });
      render(<TherapistProfile therapist={therapist} />);

      const image = screen.getByAltText("Therapist Profile Picture");
      expect(image).toHaveAttribute("src", "https://mock-url.com/therapist_pictures/folder/sub-folder/image_name-123.jpg");
    });
  });
});
