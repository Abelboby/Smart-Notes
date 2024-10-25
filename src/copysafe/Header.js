// src/components/Header.js
import React from 'react';
import { auth } from '../firebase'; // Import Firebase auth
import { signOut } from 'firebase/auth';

const Header = ({ user, setUser }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      setUser(null); // Clear the user state
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="flex justify-between p-4 bg-gray-800 text-white">
      <h1 className="text-lg">Notes App</h1>
      {user ? (  // Show logout button only if user is logged in
        <button onClick={handleLogout} className="bg-red-500 p-2 rounded">
          Logout
        </button>
      ) : null}
    </header>
  );
};

export default Header;
