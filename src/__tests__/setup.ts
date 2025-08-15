import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("next/cache", async () => {
  const originalModule = await vi.importActual("next/cache");
  return {
    ...originalModule,
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
    unstable_cache: vi.fn((fn) => fn),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => {
    const headers = new Headers();
    headers.append("x-forwarded-for", "127.0.0.1");
    headers.append("x-forwarded-proto", "http");
    headers.append("user-agent", "test-agent");
    headers.append("host", "localhost:3000");
    return headers;
  }),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}));
