import { describe, it, expect, vi, beforeEach } from "vitest";

// apiAdapter.js calls axios.create(...) as soon as it's imported, so the
// mock has to be in place before that import happens.
const mockAxiosInstance = {
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

describe("apiAdapter request/response interceptors", () => {
  let requestInterceptor;
  let responseErrorInterceptor;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    mockAxiosInstance.interceptors.request.use.mockClear();
    mockAxiosInstance.interceptors.response.use.mockClear();

    delete window.location;
    window.location = { href: "" };

    await import("./apiAdapter.js");

    requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    responseErrorInterceptor =
      mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
  });

  it("attaches an Authorization header when a token is present", () => {
    localStorage.setItem("token", "abc123");
    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBe("Bearer abc123");
  });

  it("does not attach an Authorization header when no token is present", () => {
    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it("clears the token and redirects to /signin on a 401 response", async () => {
    localStorage.setItem("token", "abc123");

    await expect(
      responseErrorInterceptor({ response: { status: 401 } })
    ).rejects.toBeTruthy();

    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.href).toBe("/signin");
  });

  it("leaves the token alone on a non-401 error", async () => {
    localStorage.setItem("token", "abc123");

    await expect(
      responseErrorInterceptor({ response: { status: 500 } })
    ).rejects.toBeTruthy();

    expect(localStorage.getItem("token")).toBe("abc123");
  });
});
