// hooks/useBackNavigation.ts
import { useRouter } from "next/navigation";

export function useBackNavigation(fallbackRoute: string = "/") {
  const router = useRouter();

  const handleBackClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackRoute);
    }
  };

  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  return {
    handleBackClick,
    canGoBack,
  };
}
