import { render, screen } from "@testing-library/react";
import SearchPage from "@/app/(with-sidebar)/search/page";

describe("Search All Page", () => {
  it("renders without crashing", () => {
    render(<SearchPage />);

    // Check if the search header is present
    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toBeInTheDocument();
  });

  it("displays patient cards", () => {
    render(<SearchPage />);

    // Check for specific patient names
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Alice Brown")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("displays report cards", () => {
    render(<SearchPage />);

    // Check for report titles
    expect(screen.getByText("Therapy Session Report")).toBeInTheDocument();
    expect(screen.getByText("Progress Evaluation")).toBeInTheDocument();
  });

  it("displays therapist cards", () => {
    render(<SearchPage />);

    // Check for therapist names
    expect(screen.getByText("Dr. Alice Green")).toBeInTheDocument();
    expect(screen.getByText("Dr. Bob White")).toBeInTheDocument();
    expect(screen.getByText("Dr. Carol Blue")).toBeInTheDocument();
    expect(screen.getByText("Dr. David Black")).toBeInTheDocument();
    expect(screen.getByText("Dr. Eve Brown")).toBeInTheDocument();
  });

  it("renders with sort options disabled", () => {
    render(<SearchPage />);

    // The component should still render even with disabled sort
    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toBeInTheDocument();
  });
});
