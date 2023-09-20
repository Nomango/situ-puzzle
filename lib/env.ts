export type ENV = "product" | "staging" | "development";

export const publicRuntimeConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
};
