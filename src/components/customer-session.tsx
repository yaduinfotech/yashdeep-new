import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

export interface CustomerUser {
  id: string;
  email: string;
  user_metadata?: { display_name?: string };
  email_confirmed_at?: string;
}

const STORAGE_KEY = 'yashdeep-customer-user';

interface CustomerSessionContextValue {
  user: CustomerUser | null;
  ready: boolean;
  setUser: (user: CustomerUser | null) => void;
  signOut: () => void;
}

const SessionContext = createContext<CustomerSessionContextValue>({
  user: null,
  ready: false,
  setUser: () => {},
  signOut: () => {},
});

export function CustomerSession({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<CustomerUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.email === 'string') {
          setUserState(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    } finally {
      setReady(true);
    }
  }, []);

  const setUser = (newUser: CustomerUser | null) => {
    setUserState(newUser);
    try {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
    router.invalidate();
    queryClient.invalidateQueries();
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, ready, setUser, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useCustomer = () => useContext(SessionContext);
