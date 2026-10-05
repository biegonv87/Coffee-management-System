import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { storage } from '../lib/storage.ts';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUser: (role: UserRole) => void;
  usersList: User[];
  canEditHarvest: boolean;
  canManageUsers: boolean;
  canRecordHarvest: boolean;
  canManageFarmers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [currentUser, setCurrentUserState] = useState<User>({
    user_id: 'USR-02',
    name: 'Faith Chepkemoi',
    username: 'officer',
    role: 'Collection Officer',
    status: 'Active',
    assigned_satellite: 'Ainabkoi Buying Centre',
    phone: '+254 722 000 222',
  });

  useEffect(() => {
    storage.initialize().then(data => {
      setUsersList(data.users);
      // Try to load saved user if exists
      const savedUserStr = localStorage.getItem('kahawa_current_user');
      if (savedUserStr) {
        try {
          const saved = JSON.parse(savedUserStr);
          const found = data.users.find(u => u.user_id === saved.user_id);
          if (found) setCurrentUserState(found);
        } catch (e) {
          console.warn('Could not load saved user:', e);
        }
      }
    });
  }, []);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem('kahawa_current_user', JSON.stringify(user));
  };

  const switchUser = (role: UserRole) => {
    const target = usersList.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const canEditHarvest = currentUser.role === 'Administrator';
  const canManageUsers = currentUser.role === 'Administrator';
  const canRecordHarvest = currentUser.role === 'Administrator' || currentUser.role === 'Collection Officer';
  const canManageFarmers = currentUser.role === 'Administrator' || currentUser.role === 'Collection Officer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUser,
        usersList,
        canEditHarvest,
        canManageUsers,
        canRecordHarvest,
        canManageFarmers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
