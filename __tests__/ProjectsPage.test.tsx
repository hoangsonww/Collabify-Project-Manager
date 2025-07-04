import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectsPageInternal from '@/pages/projects';
import * as auth0 from '@auth0/nextjs-auth0/client';

describe('ProjectsPageInternal', () => {
  afterEach(() => jest.restoreAllMocks());

  it('renders loading spinner initially', () => {
    render(<ProjectsPageInternal />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('shows empty state when no projects', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ projects: [] }) });
    render(<ProjectsPageInternal />);
    expect(await screen.findByText(/no projects yet/i)).toBeInTheDocument();
  });

  it('lists projects when fetched', async () => {
    const projects = [{ projectId: 'abc', name: 'X', description: 'Y' }];
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ projects }) });
    render(<ProjectsPageInternal />);
    expect(await screen.findByText(/X/)).toBeInTheDocument();
  });
});
