import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminPageInternal from '@/pages/admin';
import * as auth0 from '@auth0/nextjs-auth0/client';

describe('AdminPageInternal', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows loader while loading roles and user', () => {
    jest.spyOn(auth0, 'useUser').mockReturnValue({ user: null, error: null, isLoading: true });
    render(<AdminPageInternal />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('denies access if not admin', async () => {
    jest.spyOn(auth0, 'useUser').mockReturnValue({ user: { sub: 'foo' }, error: null, isLoading: false });
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ roles: ['user'] }) });
    render(<AdminPageInternal />);
    expect(await screen.findByText(/no permission/i)).toBeInTheDocument();
  });

  it('renders logs charts for admin', async () => {
    jest.spyOn(auth0, 'useUser').mockReturnValue({ user: { sub: 'admin|1' }, error: null, isLoading: false });
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ roles: ['admin'] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ logs: [{ _id: '1', type: 'login', ip: '127.0.0.1', date: new Date().toISOString() }] }) });
    render(<AdminPageInternal />);
    expect(await screen.findByText(/admin panel/i)).toBeInTheDocument();
  });
});
