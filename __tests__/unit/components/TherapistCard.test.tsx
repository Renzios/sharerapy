import { render, screen } from "@testing-library/react";
import TherapistCard from "@/components/TherapistCard";

// Mock next/image to render a regular img for testing
import React from "react";
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt ?? ""} />;
  },
}));

describe("TherapistCard Component", () => {
  const mockTherapist = {
    id: 1,
    name: "Dr. Jane Smith",
    clinic: "Sunrise Clinic",
    pictureUrl: "/testpfp.jpg",
    email: "jane.smith@example.com",
    country: "USA",
  };

  const mockTherapist2 = {
    id: 2,
    name: "Dr. John Doe",
    clinic: "Wellness Center",
    pictureUrl: "/testpfp.jpg",
    email: "john.doe@example.com",
    country: "Canada",
  };

  it("renders without crashing", () => {
    render(<TherapistCard therapist={mockTherapist} />);
    const card = screen.getByText(mockTherapist.name).closest("div");
    expect(card).toBeInTheDocument();
  });

  it("displays therapist name correctly", () => {
    render(<TherapistCard therapist={mockTherapist} />);
    const therapistName = screen.getByRole("heading", {
      name: mockTherapist.name,
    });
    expect(therapistName).toBeInTheDocument();
  });

  it("displays therapist clinic", () => {
    render(<TherapistCard therapist={mockTherapist} />);
    const clinic = screen.getByText(mockTherapist.clinic);
    expect(clinic).toBeInTheDocument();
    // email and country should also be displayed
    expect(screen.getByText(mockTherapist.email)).toBeInTheDocument();
    expect(screen.getByText(mockTherapist.country)).toBeInTheDocument();
  });

  it("displays therapist profile image", () => {
    render(<TherapistCard therapist={mockTherapist} />);
    const img = screen.getByAltText(`${mockTherapist.name} profile`);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", mockTherapist.pictureUrl);
    // verify email and country are present with the image
    expect(screen.getByText(mockTherapist.email)).toBeInTheDocument();
    expect(screen.getByText(mockTherapist.country)).toBeInTheDocument();
  });

  it("renders different therapist data correctly", () => {
    render(<TherapistCard therapist={mockTherapist2} />);
    expect(
      screen.getByRole("heading", { name: mockTherapist2.name })
    ).toBeInTheDocument();
    expect(screen.getByText(mockTherapist2.clinic)).toBeInTheDocument();
    expect(
      screen.getByAltText(`${mockTherapist2.name} profile`)
    ).toHaveAttribute("src", mockTherapist2.pictureUrl);
    expect(screen.getByText(mockTherapist2.email)).toBeInTheDocument();
    expect(screen.getByText(mockTherapist2.country)).toBeInTheDocument();
  });

  it("handles long therapist names correctly", () => {
    const longNameTherapist = {
      ...mockTherapist,
      name: "Dr. Elizabeth Alexandra Montgomery-Smith",
    };
    render(<TherapistCard therapist={longNameTherapist} />);
    const therapistName = screen.getByRole("heading", {
      name: longNameTherapist.name,
    });
    expect(therapistName).toBeInTheDocument();
  });

  it("displays all required information fields", () => {
    render(<TherapistCard therapist={mockTherapist} />);
    expect(
      screen.getByRole("heading", { name: mockTherapist.name })
    ).toBeInTheDocument();
    expect(screen.getByText(mockTherapist.clinic)).toBeInTheDocument();
    expect(
      screen.getByAltText(`${mockTherapist.name} profile`)
    ).toBeInTheDocument();
    expect(screen.getByText(mockTherapist.email)).toBeInTheDocument();
    expect(screen.getByText(mockTherapist.country)).toBeInTheDocument();
  });

  it("has proper layout structure", () => {
    render(<TherapistCard therapist={mockTherapist} />);
    const card = screen.getByText(mockTherapist.name).closest("div");
    expect(card).toBeInTheDocument();
  });

  it("maintains semantic HTML structure", () => {
    render(<TherapistCard therapist={mockTherapist} />);
    // Therapist name should be an h1 (main heading for the card)
    const therapistName = screen.getByRole("heading", {
      level: 1,
      name: mockTherapist.name,
    });
    expect(therapistName).toBeInTheDocument();
  });
});
