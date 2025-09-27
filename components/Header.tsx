import MenuIcon from "@mui/icons-material/Menu";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="p-4 border-b border-bordergray flex items-center gap-3 h-[3.75rem] md:h-[5.3125rem] bg-white">
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
