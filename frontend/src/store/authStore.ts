import { create } from 'zustand';
import type { Organization, User } from '../types';

type AuthState = {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  setSession: (session: { user: User; organization: Organization }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  isAuthenticated: false,
  setSession: ({ user, organization }) => {
    localStorage.setItem('organization_id', organization.id);
    set({ user, organization, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('organization_id');
    set({ user: null, organization: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
