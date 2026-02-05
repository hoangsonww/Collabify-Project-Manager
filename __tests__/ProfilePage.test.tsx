import React from "react";
import { render, screen } from "@testing-library/react";
import ProfilePageInternal from "@/pages/profile";
import * as auth0 from "@auth0/nextjs-auth0/client";

describe("ProfilePageInternal", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows loading spinner when isLoading is true", () => {
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: null, error: null, isLoading: true });
    render(<ProfilePageInternal />);
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("shows error message when error is returned", () => {
    const err = new Error("Test error");
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: null, error: err, isLoading: false });
    render(<ProfilePageInternal />);
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it("prompts login when not authenticated", () => {
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: null, error: null, isLoading: false });
    render(<ProfilePageInternal />);
    expect(screen.getByText(/Please log in/i)).toBeInTheDocument();
  });

  it("renders profile card when user is present", async () => {
    const fakeUser = {
      name: "Alice",
      email: "a@b.com",
      picture: "",
      updated_at: new Date().toISOString(),
      email_verified: true,
    };
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: fakeUser, error: null, isLoading: false });
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { name: "Alice", nickname: "Al" } }),
    });
    render(<ProfilePageInternal />);
    expect(await screen.findByText(/Alice/)).toBeInTheDocument();
  });
});
