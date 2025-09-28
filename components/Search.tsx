import SearchIcon from "@mui/icons-material/Search";

interface SearchProps {
  /** Controls the width of the search component */
  size?: "full" | string;
  /** Value of the search input */
  value?: string;
  /** Callback function when input value changes */
  onChange?: (value: string) => void;
  /** Callback function when search is submitted */
  onSearch?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A flexible search input component with customizable width and consistent styling.
 *
 * @param size - Controls width: 'full' for w-full, or custom width (e.g., '20rem', '300px')
 * @param value - Controlled input value
 * @param onChange - Handler for input changes
 * @param onSearch - Handler for search submission (Enter key or icon click)
 * @param className - Additional CSS classes
 */
export default function Search({
  size = "full",
  value,
  onChange,
  onSearch,
  className = "",
}: SearchProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(value || "");
    }
  };

  const handleSearchClick = () => {
    onSearch?.(value || "");
  };

  // Determine width style
  const widthStyle = size === "full" ? "w-full" : "";
  const customWidth = size !== "full" ? { width: size } : {};

  return (
    <div
      className={`
        relative flex items-center
        h-[2.8125rem]
        ${widthStyle}
        ${className}
      `}
      style={customWidth}
    >
      <button
        type="button"
        onClick={handleSearchClick}
        className="
          absolute left-3
          flex items-center justify-center
          w-6 h-6
          text-gray-400 hover:text-primary
          transition-colors duration-200
        "
        aria-label="Search"
      >
        <SearchIcon className="w-5 h-5" />
      </button>

      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search"
        className="
          w-full h-full
          pl-12 pr-4
          bg-white border border-bordergray
          rounded-full
          text-sm 
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-colors duration-200
        "
      />
    </div>
  );
}
