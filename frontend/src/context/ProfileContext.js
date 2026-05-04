import React, { createContext, useState, useEffect } from 'react';

export const ProfileContext = createContext();

const getInitialProfile = () => {
  const saved = localStorage.getItem('profileData');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore invalid saved profile
    }
  }
  return null;
};

export function ProfileProvider({ children }) {
  const [profileData, setProfileData] = useState(getInitialProfile);

  useEffect(() => {
    if (profileData) {
      localStorage.setItem('profileData', JSON.stringify(profileData));
    } else {
      localStorage.removeItem('profileData');
    }
  }, [profileData]);

  const updateProfile = (newData) => {
    setProfileData(prev => ({
      ...(prev || {}),
      ...newData
    }));
  };

  const setProfile = (profile) => {
    setProfileData(profile);
  };

  const clearProfile = () => {
    setProfileData(null);
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile, setProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}


