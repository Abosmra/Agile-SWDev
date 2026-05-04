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
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'Student',
    enrolledCourses: 3,
    joinDate: 'January 15, 2024',
    department: 'Computer Science'
  };
};

export function ProfileProvider({ children }) {
  const [profileData, setProfileData] = useState(getInitialProfile);

  useEffect(() => {
    localStorage.setItem('profileData', JSON.stringify(profileData));
  }, [profileData]);

  const updateProfile = (newData) => {
    setProfileData(prev => ({
      ...prev,
      ...newData
    }));
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}


