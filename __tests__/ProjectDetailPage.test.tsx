import React from "react";
import { render, screen } from "@testing-library/react";
import ProjectDetailPageInternal from "@/pages/projects/[id]";
import * as auth0 from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

describe("ProjectDetailPageInternal", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ query: { id: "abc" } });
  });
  afterEach(() => jest.restoreAllMocks());

  it("shows loader when loading project", () => {
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: null, isLoading: true });
    render(<ProjectDetailPageInternal />);
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("shows error message when fetch fails", async () => {
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: { sub: "u1" }, isLoading: false });
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    render(<ProjectDetailPageInternal />);
    expect(
      await screen.findByText(/failed to fetch project/i),
    ).toBeInTheDocument();
  });

  it("renders project details when fetched", async () => {
    const project = {
      projectId: "abc",
      name: "Test",
      description: "Desc",
      tasks: [],
      membership: [],
    };
    jest
      .spyOn(auth0, "useUser")
      .mockReturnValue({ user: { sub: "u1" }, isLoading: false });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ project }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ membership: [] }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<ProjectDetailPageInternal />);
    expect(await screen.findByText(/Test/)).toBeInTheDocument();
    expect(screen.getByText(/Desc/)).toBeInTheDocument();
  });
});
