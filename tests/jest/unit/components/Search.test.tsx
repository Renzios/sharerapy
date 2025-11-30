import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  describe("Rendering", () => {
    it("displays the search icon", () => {
      render(<Search />);

      const searchIcon = screen.getByTestId("search-icon");
      expect(searchIcon).toBeInTheDocument();
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

    it("applies full width when size is 'full'", () => {
      render(<Search size="full" />);

      const container = screen.getByRole("textbox").parentElement;
      expect(container).toHaveClass("w-full");
    });

    it("applies custom className to container", () => {
      render(<Search className="custom-class" />);

      const container = screen.getByRole("textbox").parentElement;
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("User Interaction", () => {
    it("handles input value changes", async () => {
        const user = userEvent.setup();
    render(<Search value="" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;

    await user.type(input, "test");

    expect(mockOnChange).toHaveBeenCalledTimes(4);
    expect(mockOnChange).toHaveBeenLastCalledWith("t");
    });

    it("calls onSearch when Enter key is pressed", async () => {
      const user = userEvent.setup();
      render(<Search value="search term" onSearch={mockOnSearch} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "{Enter}");

      expect(mockOnSearch).toHaveBeenCalledWith("search term");
    });

    it("calls onSearch when search icon is clicked", async () => {
      const user = userEvent.setup();
      render(<Search value="search term" onSearch={mockOnSearch} />);

      const searchButton = screen.getByRole("button", { name: /search/i });
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledWith("search term");
    });

    it("handles empty value in onSearch callbacks", async () => {
      const user = userEvent.setup();
      render(<Search onSearch={mockOnSearch} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "{Enter}");

      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("ignores other key presses", async () => {
      const user = userEvent.setup();
      render(<Search value="test" onSearch={mockOnSearch} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "{Escape}{Tab}");

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("handles foreign character input", async () => {
      const user = userEvent.setup();
      render(<Search value="" onChange={mockOnChange} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "搜索Тест");
      expect(mockOnChange).toHaveBeenCalled();
    });

    it("accepts paste events", async () => {
      const user = userEvent.setup();
      render(<Search value="" onChange={mockOnChange} />);
      const input = screen.getByRole("textbox");

      await user.click(input);
      await user.paste("PastedText");
      expect(mockOnChange).toHaveBeenCalledWith("PastedText");
    });
  });
});
