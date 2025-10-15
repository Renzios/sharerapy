import { render, screen, fireEvent } from "@testing-library/react";
import Search from "@/components/general/Search";

// Mock MUI Search Icon
jest.mock("@mui/icons-material/Search", () => {
  return function MockSearchIcon() {
    return <svg data-testid="search-icon" />;
  };
});

describe("Search Component", () => {
  const mockOnChange = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<Search />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Search");
  });

  it("displays the search icon", () => {
    render(<Search />);

    const searchIcon = screen.getByTestId("search-icon");
    expect(searchIcon).toBeInTheDocument();
  });

  it("has accessible search button", () => {
    render(<Search />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it("handles input value changes", () => {
    render(<Search value="test" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("test");

    fireEvent.change(input, { target: { value: "new value" } });
    expect(mockOnChange).toHaveBeenCalledWith("new value");
  });

  it("calls onSearch when Enter key is pressed", () => {
    render(<Search value="search term" onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnSearch).toHaveBeenCalledWith("search term");
  });

  it("calls onSearch when search icon is clicked", () => {
    render(<Search value="search term" onSearch={mockOnSearch} />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith("search term");
  });

  it("handles empty value in onSearch callbacks", () => {
    render(<Search onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnSearch).toHaveBeenCalledWith("");
  });

  it("renders with default container", () => {
    render(<Search />);

    const input = screen.getByRole("textbox");
    expect(input.parentElement).toBeInTheDocument();
  });

  it("applies custom width when size prop is provided", () => {
    render(<Search size="20rem" />);

    const container = screen.getByRole("textbox").parentElement;
    expect(container).toHaveStyle({ width: "20rem" });
  });

  it("ignores other key presses", () => {
    render(<Search value="test" onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
