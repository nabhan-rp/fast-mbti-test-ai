
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Simulate initial auth check

  // Mock initial auth state check (e.g., from localStorage)
  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem('mbtiAppUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('mbtiAppUser');
      }
    }
    setLoading(false);
  }, []);

  // Mock login functions
  const loginWithGoogle = async (): Promise<void> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser: User = {
      uid: 'mockGoogleUser123',
      email: 'user@example.com',
      displayName: 'Mock Google User',
      photoURL: `https://picsum.photos/seed/${Math.random()}/100/100`
    };
    setCurrentUser(mockUser);
    localStorage.setItem('mbtiAppUser', JSON.stringify(mockUser));
    setLoading(false);
  };

  const loginWithEmail = async (email: string, _pass: string): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
     const mockUser: User = {
      uid: `mockEmailUser-${email.split('@')[0]}`,
      email: email,
      displayName: email.split('@')[0],
      photoURL: `https://picsum.photos/seed/${email}/100/100`
    };
    setCurrentUser(mockUser);
    localStorage.setItem('mbtiAppUser', JSON.stringify(mockUser));
    setLoading(false);
  };
  
  const signupWithEmail = async (email: string, _pass: string): Promise<void> => {
    // For mock, signup is same as login
    return loginWithEmail(email, _pass);
  };


  const logout = async (): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentUser(null);
    localStorage.removeItem('mbtiAppUser');
    localStorage.removeItem( 'mbtiAppUserHistory'); // Also clear history on logout for this mock setup
    setLoading(false);
  };

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
