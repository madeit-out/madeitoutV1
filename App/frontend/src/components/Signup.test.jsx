import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SignUp from "./Signup";
import { AuthAPI } from "../adapters/apiAdapter";

vi.mock("../adapters/apiAdapter", () => ({
  AuthAPI: {
    signUp: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderSignup() {
  return render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );
}

async function fillForm(user, { username, email, password }) {
  await user.type(screen.getByPlaceholderText("Choose a username"), username);
  await user.type(screen.getByPlaceholderText("Enter your email"), email);
  await user.type(screen.getByPlaceholderText("Create a password"), password);
}

describe("SignUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("rejects a password under 8 characters without calling the API", async () => {
    const user = userEvent.setup();
    renderSignup();

    await fillForm(user, {
      username: "testuser",
      email: "test@example.com",
      password: "short1",
    });
    await user.click(screen.getByRole("button", { name: /create account|sign up/i }));

    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(AuthAPI.signUp).not.toHaveBeenCalled();
  });

  it("submits once with the form data and stores the token on success", async () => {
    AuthAPI.signUp.mockResolvedValueOnce({ access_token: "new-token" });
    const user = userEvent.setup();
    renderSignup();

    await fillForm(user, {
      username: "testuser",
      email: "test@example.com",
      password: "longenoughpassword",
    });
    await user.click(screen.getByRole("button", { name: /create account|sign up/i }));

    await waitFor(() => expect(AuthAPI.signUp).toHaveBeenCalledTimes(1));
    expect(AuthAPI.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "testuser",
        email: "test@example.com",
        password: "longenoughpassword",
      })
    );
    expect(localStorage.getItem("token")).toBe("new-token");
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("shows the API's error message and does not navigate on failure", async () => {
    AuthAPI.signUp.mockRejectedValueOnce(new Error("Email already exists"));
    const user = userEvent.setup();
    renderSignup();

    await fillForm(user, {
      username: "testuser",
      email: "taken@example.com",
      password: "longenoughpassword",
    });
    await user.click(screen.getByRole("button", { name: /create account|sign up/i }));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
