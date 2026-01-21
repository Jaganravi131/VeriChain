import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext(null);

// Storage keys
const STORAGE_KEYS = {
  USERS: 'verichain_users',
  CURRENT_USER: 'verichain_current_user',
  SESSION: 'verichain_session',
};

// Default demo users
const DEFAULT_USERS = [
  {
    id: 'inst-1',
    email: 'mit@institution.edu',
    password: 'Demo123!',
    name: 'Massachusetts Institute of Technology',
    type: 'institution',
    walletAddress: '0x1234567890123456789012345678901234567890',
    description: 'World-renowned research university',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'inst-2',
    email: 'stanford@institution.edu',
    password: 'Demo123!',
    name: 'Stanford University',
    type: 'institution',
    walletAddress: '0x2345678901234567890123456789012345678901',
    description: 'Leading research and teaching institution',
    isVerified: true,
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'inst-3',
    email: 'coursera@institution.edu',
    password: 'Demo123!',
    name: 'Coursera',
    type: 'institution',
    walletAddress: '0x3456789012345678901234567890123456789012',
    description: 'Online learning platform',
    isVerified: true,
    createdAt: '2024-01-03T00:00:00.000Z',
  },
  {
    id: 'user-1',
    email: 'alice@student.edu',
    password: 'Demo123!',
    name: 'Alice Johnson',
    type: 'user',
    walletAddress: '0x4567890123456789012345678901234567890123',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'user-2',
    email: 'bob@student.edu',
    password: 'Demo123!',
    name: 'Bob Smith',
    type: 'user',
    walletAddress: '0x5678901234567890123456789012345678901234',
    createdAt: '2024-02-02T00:00:00.000Z',
  },
  {
    id: 'user-3',
    email: 'carol@student.edu',
    password: 'Demo123!',
    name: 'Carol Williams',
    type: 'user',
    walletAddress: '0x6789012345678901234567890123456789012345',
    createdAt: '2024-02-03T00:00:00.000Z',
  },
  {
    id: 'user-4',
    email: 'david@professional.com',
    password: 'Demo123!',
    name: 'David Brown',
    type: 'user',
    walletAddress: '0x7890123456789012345678901234567890123456',
    createdAt: '2024-02-04T00:00:00.000Z',
  },
  {
    id: 'user-5',
    email: 'emma@developer.io',
    password: 'Demo123!',
    name: 'Emma Davis',
    type: 'user',
    walletAddress: '0x8901234567890123456789012345678901234567',
    createdAt: '2024-02-05T00:00:00.000Z',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize users and session on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    try {
      // Initialize demo users if not present
      const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!existingUsers) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      }

      // Check for existing session
      const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const sessionUser = users.find(u => u.id === session.userId);
        
        if (sessionUser && session.expiresAt > Date.now()) {
          setUser(sessionUser);
          setIsAuthenticated(true);
        } else {
          // Clear expired session
          localStorage.removeItem(STORAGE_KEYS.SESSION);
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const foundUser = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Create session (24 hours)
      const session = {
        userId: foundUser.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      
      // Don't include password in the state
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);

      return { success: true, user: userWithoutPassword };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async ({ name, email, password, type }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate password
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!/[0-9]/.test(password)) {
        throw new Error('Password must contain at least one number');
      }
      if (!/[!@#$%^&*]/.test(password)) {
        throw new Error('Password must contain at least one special character (!@#$%^&*)');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      
      // Check if email already exists
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists');
      }

      // Create new user
      const newUser = {
        id: uuidv4(),
        email,
        password,
        name,
        type: type === 'institution' ? 'institution' : 'user',
        walletAddress: null,
        createdAt: new Date().toISOString(),
        ...(type === 'institution' && {
          description: '',
          isVerified: false,
        }),
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Auto-login after signup
      const session = {
        userId: newUser.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);

      return { success: true, user: userWithoutPassword };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Update state
      const { password: _, ...userWithoutPassword } = users[userIndex];
      setUser(userWithoutPassword);

      return { success: true, user: userWithoutPassword };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  const updateWalletAddress = useCallback(async (walletAddress) => {
    return updateProfile({ walletAddress });
  }, [updateProfile]);

  const getAllUsers = useCallback(() => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users.map(({ password: _, ...user }) => user);
  }, []);

  const getInstitutions = useCallback(() => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users
      .filter(u => u.type === 'institution')
      .map(({ password: _, ...user }) => user);
  }, []);

  const getUserByWallet = useCallback((walletAddress) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const foundUser = users.find(
      u => u.walletAddress?.toLowerCase() === walletAddress?.toLowerCase()
    );
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      return userWithoutPassword;
    }
    return null;
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    updateWalletAddress,
    getAllUsers,
    getInstitutions,
    getUserByWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
