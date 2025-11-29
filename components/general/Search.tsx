import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@/components/general/Button";

interface SearchProps {
  size?: "full" | string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  id?: string;
  aiMode?: boolean;
  placeholder?: string;
}

export default function Search({
  size = "full",
  value,
  onChange,
  onSearch,
  className = "",
  id,
  aiMode = false,
  placeholder = "Search...",
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
          text-darkgray hover:text-primary
          transition-colors duration-200
          z-10
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
        placeholder={placeholder}
        className={`
          w-full h-full
          pl-12 
          ${aiMode ? "pr-28" : "pr-4"} /* Dynamic padding if button exists */
          bg-white border border-bordergray
          rounded-full
          text-sm 
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-colors duration-200
        `}
      />

      {aiMode && (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10">
          <Link href="/ai-mode">
            <Button
              variant="outline"
              className="text-xs h-8 px-3"
              shape="pill"
              aiMode={true}
              onClick={() => onSearch?.(value || "")}
            >
              AI Mode
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
