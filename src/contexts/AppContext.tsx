import React, { createContext, useContext, useState, useEffect } from 'react';

interface UISettings {
  buttonStyle: 'filled' | 'tonal' | 'outlined' | 'elevated';
  buttonRadius: 'square' | 'rounded' | 'pill';
  accentColor: 'cyan' | 'blue' | 'purple' | 'green' | 'orange';
}

export interface CallHistoryItem {
  id: string;
  username: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'received' | 'missed' | 'declined';
  duration: number; // in seconds
  timestamp: Date;
}

interface User {
  username: string;
  email?: string;
  hasPassword: boolean;
  videoQuality: 'auto' | '4k' | '1080p' | '720p' | '480p';
  frameRate: 'auto' | '60' | '30' | '24';
  audioQuality: 'high' | 'medium' | 'low';
  dataSaving: boolean;
  showUsername: boolean;
  audioPrivacy: 'everyone' | 'recent' | 'selected';
  videoPrivacy: 'everyone' | 'recent' | 'selected';
  allowedUsers: string[];
  uiSettings: UISettings;
}

interface OnlineUser {
  username: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface AppContextType {
  user: User | null;
  isLoggedIn: boolean;
  networkStatus: 'online' | 'offline' | 'server-down';
  ping: number;
  onlineUsers: OnlineUser[];
  callHistory: CallHistoryItem[];
  login: (username: string, password?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setPassword: (password: string) => void;
  removePassword: () => void;
  addCallToHistory: (call: Omit<CallHistoryItem, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'server-down'>('online');
  const [ping, setPing] = useState(45);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [onlineUsers] = useState<OnlineUser[]>([
    { username: 'Alex', isOnline: true },
    { username: 'Jordan', isOnline: true },
    { username: 'Sam', isOnline: false, lastSeen: new Date() },
    { username: 'Taylor', isOnline: true },
    { username: 'Morgan', isOnline: false, lastSeen: new Date() },
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('veocall_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedHistory = localStorage.getItem('veocall_history');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setCallHistory(parsed.map((item: CallHistoryItem) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    } else {
      // Demo call history
      setCallHistory([
        { id: '1', username: 'Alex', type: 'video', direction: 'outgoing', status: 'received', duration: 150, timestamp: new Date(Date.now() - 3600000) },
        { id: '2', username: 'Jordan', type: 'audio', direction: 'incoming', status: 'missed', duration: 0, timestamp: new Date(Date.now() - 7200000) },
        { id: '3', username: 'Sam', type: 'video', direction: 'incoming', status: 'received', duration: 300, timestamp: new Date(Date.now() - 86400000) },
        { id: '4', username: 'Taylor', type: 'audio', direction: 'outgoing', status: 'received', duration: 45, timestamp: new Date(Date.now() - 172800000) },
      ]);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Simulate ping updates
    const pingInterval = setInterval(() => {
      setPing(Math.floor(Math.random() * 100) + 20);
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
    };
  }, []);

  const login = (username: string, password?: string) => {
    const newUser: User = {
      username,
      hasPassword: !!password,
      videoQuality: 'auto',
      frameRate: 'auto',
      audioQuality: 'high',
      dataSaving: false,
      showUsername: true,
      audioPrivacy: 'everyone',
      videoPrivacy: 'everyone',
      allowedUsers: [],
      uiSettings: {
        buttonStyle: 'filled',
        buttonRadius: 'rounded',
        accentColor: 'cyan',
      },
    };
    setUser(newUser);
    localStorage.setItem('veocall_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('veocall_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('veocall_user', JSON.stringify(updatedUser));
    }
  };

  const setPassword = (password: string) => {
    if (user && password) {
      updateUser({ hasPassword: true });
      localStorage.setItem('veocall_password', password);
    }
  };

  const removePassword = () => {
    if (user) {
      updateUser({ hasPassword: false });
      localStorage.removeItem('veocall_password');
    }
  };

  const addCallToHistory = (call: Omit<CallHistoryItem, 'id' | 'timestamp'>) => {
    const newCall: CallHistoryItem = {
      ...call,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    const updatedHistory = [newCall, ...callHistory];
    setCallHistory(updatedHistory);
    localStorage.setItem('veocall_history', JSON.stringify(updatedHistory));
  };

  return (
    <AppContext.Provider value={{
      user,
      isLoggedIn: !!user,
      networkStatus,
      ping,
      onlineUsers,
      callHistory,
      login,
      logout,
      updateUser,
      setPassword,
      removePassword,
      addCallToHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
