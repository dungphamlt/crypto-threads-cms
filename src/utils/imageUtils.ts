// Default placeholder image as base64 SVG
const DEFAULT_PLACEHOLDER_SMALL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA2MCA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQ1IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxOEg0MFYyN0gyMFYxOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDIySDM1VjIzSDI1VjIyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";

const DEFAULT_PLACEHOLDER_LARGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaD0iNDUwIiB2aWV3Qm94PSIwIDAgODAwIDQ1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTMwMCAyMDBINTAwVjI1MEgzMDBWMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzUwIDIyMEg0NTBWMjMwSDM1MFYyMjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=";

/**
 * Validates and returns a safe image URL
 * @param coverUrl - The cover URL to validate
 * @param size - Size of placeholder ('small' or 'large')
 * @returns Safe image URL or placeholder
 */
export const getSafeImageUrl = (
  coverUrl: string | undefined | null,
  size: "small" | "large" = "small"
): string => {
  // Check if coverUrl is valid
  if (
    coverUrl &&
    typeof coverUrl === "string" &&
    coverUrl !== "string" &&
    coverUrl.startsWith("http")
  ) {
    return coverUrl;
  }

  // Return appropriate placeholder
  return size === "large"
    ? DEFAULT_PLACEHOLDER_LARGE
    : DEFAULT_PLACEHOLDER_SMALL;
};

/**
 * Checks if an image URL is valid
 * @param url - URL to check
 * @returns boolean indicating if URL is valid
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
  return !!(
    url &&
    typeof url === "string" &&
    url !== "string" &&
    url.startsWith("http")
  );
};
