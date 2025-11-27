import SearchIcon from "@mui/icons-material/Search";

interface SearchProps {
  size?: "full" | string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  id?: string;
}

export default function Search({
  size = "full",
  value,
  onChange,
  onSearch,
  className = "",
  id,
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

  const widthStyle = size === "full" ? "w-full" : "";
  const customWidth = size !== "full" ? { width: size } : {};

  return (
    <div
      className={`
        relative flex items-center
        h-11.25
        ${widthStyle}
        ${className}
      `}
      style={customWidth}
    >
      <button
        id="search-btn"
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
        <SearchIcon className="w-5 h-5 hover:cursor-pointer" />
      </button>

      <input
        id={id}
        suppressHydrationWarning={true}
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
