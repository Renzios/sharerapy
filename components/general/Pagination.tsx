import Back from "@mui/icons-material/ArrowBackIos";
import Next from "@mui/icons-material/ArrowForwardIos";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPending?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isPending = false,
}: PaginationProps) {
  const getPageNumbers = () => {
    // If total pages is less than 5, show all pages
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Total pages >= 5, always show 5 pages
    let start = currentPage - 2;
    let end = currentPage + 2;

    // Adjust if too close to the beginning
    if (start < 1) {
      start = 1;
      end = 5;
    }

    // Adjust if too close to the end
    if (end > totalPages) {
      end = totalPages;
      start = totalPages - 4;
    }

    // Generate array of page numbers from start to end
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className="flex items-center justify-center border border-bordergray p-2 bg-white rounded-lg hover:bg-bordergray/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Back fontSize="small" className="text-darkgray" />
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            disabled={isPending}
            className={`py-2 px-3 rounded-lg font-Noto-Sans text-black text-sm font-medium ${
              currentPage === page
                ? "bg-primary text-white"
                : "border border-bordergray bg-white text-darkgray hover:bg-bordergray/30"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className="flex items-center justify-center border border-bordergray p-2 bg-white rounded-lg hover:bg-bordergray/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Next fontSize="small" className="text-darkgray" />
      </button>
    </div>
  );
}
