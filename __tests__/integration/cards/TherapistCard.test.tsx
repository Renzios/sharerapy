import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TherapistCard from "@/components/cards/TherapistCard";


// Mock next/link to render a plain anchor so we can assert href and click behavior
jest.mock("next/link", () => {
  return function Link({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

// Mock next/image to a plain <img /> for predictable testing
jest.mock("next/image", () => {
  return function MockImage(
    props: React.ImgHTMLAttributes<HTMLImageElement>
  ) {
    // next/image adds decoding="async" by default
    return <img decoding="async" {...props} />;
  };
});

// Mock storage util to control returned src and assert calls
jest.mock("@/lib/utils/storage", () => ({
  getPublicURL: jest.fn((bucket: string, key: string) => `https://public/${bucket}/${key}`),
}));

type Therapist = Parameters<typeof TherapistCard>[0]["therapist"];

const makeTherapist = (overrides?: Partial<Therapist>): Therapist => ({
  id: "t1",
  name: "Dr. Alice",
  picture: "alice.png",
  clinic: {
    id: 10,
    clinic: "Mindful Clinic",
    country_id: 63,
    country: { id: 63, country: "Philippines" },
  },
  ...overrides,
});

describe("Rendering", () => {
  it("renders therapist image, name, clinic, and country", () => {
    const therapist = makeTherapist();
    render(<TherapistCard therapist={therapist} />);

    const img = screen.getByRole("img", { name: "Dr. AlicePFP" }) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBe("https://public/therapist_pictures/alice.png");

    expect(screen.getByRole("heading", { level: 1, name: "Dr. Alice" })).toBeInTheDocument();
    expect(screen.getByText("Mindful Clinic")).toBeInTheDocument();
    expect(screen.getByText("Philippines")).toBeInTheDocument();
  });

  it('shows "N/A" when clinic is missing', () => {
    const therapist = makeTherapist({
      clinic: null as unknown as Therapist["clinic"],
    });
    render(<TherapistCard therapist={therapist} />);

    // Both clinic name and country name fall back to N/A
    const naItems = screen.getAllByText("N/A");
    expect(naItems.length).toBe(2);
  });

  it('shows "N/A" when country is missing but clinic exists', () => {
    const therapist = makeTherapist({
      clinic: {
        id: 11,
        clinic: "Mindful Clinic",
        country_id: 0,
        country: null as unknown as Therapist["clinic"]["country"],
      },
    });
    render(<TherapistCard therapist={therapist} />);
    
    // Only country name falls back to N/A
    expect(screen.getByText("Mindful Clinic")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("supports other language characters in name and clinic", () => {
    // Kanji
    const therapist = makeTherapist({
      name: "ドクター山田", 
        clinic: {
            id: 15,
            clinic: "健康クリニック",
            country_id: 81,
            country: { id: 81, country: "Japan" },
        },
    });
    render(<TherapistCard therapist={therapist} />);
    expect(screen.getByRole("heading", { level: 1, name: "ドクター山田" })).toBeInTheDocument();
    expect(screen.getByText("健康クリニック")).toBeInTheDocument();

    // Cyrillic
    const therapist2 = makeTherapist({
      name: "Др. Иванов",
      clinic: {
        id: 16,
        clinic: "Клиника здоровья",
        country_id: 82,
        country: { id: 82, country: "Russia" },
      },
      picture: "ivanov.png",
    });

    render(<TherapistCard therapist={therapist2} />);
    expect(screen.getByRole("heading", { level: 1, name: "Др. Иванов" })).toBeInTheDocument();
    expect(screen.getByText("Клиника здоровья")).toBeInTheDocument();
  });


  it("applies expected container classes", () => {
    const { container } = render(<TherapistCard therapist={makeTherapist()} />);
    const link = container.firstElementChild as HTMLElement;
    expect(link.className).toContain("flex");
    expect(link.className).toContain("hover:bg-bordergray/30");
    expect(link.className).toContain("cursor-pointer");
  });
});

describe("User Interaction", () => {
  it("is a link that points to the therapist's profile URL", () => {
    const therapist = makeTherapist({ id: "thera123" });
    render(<TherapistCard therapist={therapist} />);

    const link = screen.getByRole("link", { name: /dr\. alice/i });
    expect(link.getAttribute("href")).toBe("/profile/therapist/thera123");
  });

  it("is focusable and clickable", async () => {
    render(<TherapistCard therapist={makeTherapist()} />);
    const user = userEvent.setup();

    const link = screen.getByRole("link", { name: /dr\. alice/i });

    await user.tab();
    expect(document.activeElement).toBe(link);

    // Clicking shouldn't throw; we just ensure it's clickable
    await user.click(link);
    expect(link).toBeInTheDocument();
  });

  it("supports hover without changing content", async () => {
    render(<TherapistCard therapist={makeTherapist()} />);
    const user = userEvent.setup();
    const link = screen.getByRole("link", { name: /dr\. alice/i });

    await user.hover(link);
    expect(screen.getByRole("heading", { level: 1, name: "Dr. Alice" })).toBeInTheDocument();
    expect(screen.getByText("Mindful Clinic")).toBeInTheDocument();
  });
});

describe("Props Handling", () => {
  it("uses therapist.id to construct href", () => {
    const therapist = makeTherapist({ id: "abc456" });
    render(<TherapistCard therapist={therapist} />);

    const link = screen.getByRole("link", { name: /dr\. alice/i });
    expect(link.getAttribute("href")).toBe("/profile/therapist/abc456");
  });
});