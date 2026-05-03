import React, { createContext, useState } from 'react';

export const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });

  const setRole = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const clearRole = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  return (
    <RoleContext.Provider value={{ userRole, setRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
}
