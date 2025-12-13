import { useRouter } from "next/navigation";

export function useFilters<T>() {
  function setFilters(
    filters: Partial<T>,
    sortBy?: keyof T,
    sortOrder: "asc" | "desc" = "asc"
  ): void {
    const router = useRouter();
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    if (sortBy) {
      searchParams.append("sortBy", String(sortBy));
      searchParams.append("sortOrder", sortOrder);
    }
    const queryString = searchParams.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    router.push(newUrl);
  }

  function resetFilters(): void {
    const router = useRouter();
    router.push(window.location.pathname);
  }

  return {
    setFilters,
    resetFilters,
  };
}
