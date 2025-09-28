import MenuIcon from "@mui/icons-material/Menu";

interface HeaderProps {
  onMenuClick: () => void;
}

/**
 * Renders a header component, acts as a filler on desktop, and contains a menu toggle button on mobile.
 *
 * @param onMenuClick - Function to be called when menu button is clicked (mobile only)
 */
export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header
      className="
        sticky top-0 z-30
        flex items-center
        h-[3.75rem] p-4 gap-3 
        border-b border-bordergray bg-white
        md:h-[5.3125rem] 
      "
    >
      <button
        onClick={onMenuClick}
        className="p-1 hover:bg-gray-100 rounded-md transition-colors md:hidden"
        aria-label="Toggle sidebar"
      >
        <MenuIcon className="text-xl" />
      </button>
    </header>
  );
}
