// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
  // 1. Initialize user state from sessionStorage on component mount (e.g., refresh)
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('agricare_user');
    // Parse the JSON string back into a JavaScript object
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Derived state to easily check if authenticated
  const isAuthenticated = !!user;

  // Function to handle login
  const login = (userData) => {
    setUser(userData);
    // Store user data as a JSON string in sessionStorage
    sessionStorage.setItem('agricare_user', JSON.stringify(userData));
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
    // Remove the item from sessionStorage
    sessionStorage.removeItem('agricare_user');
  };

  // The value that will be available to all consuming components
  const contextValue = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to easily consume the AuthContext
export const useAuth = () => useContext(AuthContext);