import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoogleSignup } from '@/components/google-signup';

const { signInWithOAuth } = vi.hoisted(() => ({ signInWithOAuth: vi.fn() }));
vi.mock('@/lib/auth-client', () => ({ authClient: { signInWithOAuth } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe('Google signup', () => {
  it('uses Google with the public same-origin account callback', async () => {
    signInWithOAuth.mockResolvedValue({ redirected: true });
    render(<GoogleSignup />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledWith('google', {
      redirect_uri: `${window.location.origin}/auth`,
    }));
  });

  it('blocks duplicate requests while Google sign-in is pending', async () => {
    let finish: ((value: { redirected: boolean }) => void) | undefined;
    signInWithOAuth.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    render(<GoogleSignup />);
    const button = screen.getByRole('button', { name: 'Continue with Google' });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(signInWithOAuth).toHaveBeenCalledTimes(1);
    finish?.({ redirected: false });
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('allows retry after a provider error', async () => {
    signInWithOAuth.mockResolvedValue({ error: new Error('cancelled') });
    render(<GoogleSignup />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeVisible());
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
  });
});
