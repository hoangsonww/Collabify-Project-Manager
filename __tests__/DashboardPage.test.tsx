import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardPageInternal from "@/pages/dashboard";
import * as auth0 from "@auth0/nextjs-auth0/client";

describe("DashboardPageInternal", () => {
  afterEach(() => jest.restoreAllMocks());

  it("shows spinner on load", () => {
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: null, error: null, isLoading: true });
    render(<DashboardPageInternal />);
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("prompts login when no session", async () => {
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: null, error: null, isLoading: false });
    render(<DashboardPageInternal />);
    expect(await screen.findByText(/please log in/i)).toBeInTheDocument();
  });

  it("renders stats when session exists", async () => {
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: { sub: "u1" }, error: null, isLoading: false });
    const mockData = {
      userSub: "u1",
      totalProjects: 2,
      totalTasks: 5,
      doneTasks: 3,
      todoTasks: 1,
      inProgressTasks: 1,
      topProjects: [],
      largestProjectName: "",
      smallestProjectName: "",
      projectStats: [],
      allProjects: [],
    };
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => mockData });
    render(<DashboardPageInternal />);
    expect(await screen.findByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });
});
