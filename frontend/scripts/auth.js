import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, googleLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your Google Client ID
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your Google API Key

let auth2;
let currentUser = null;

function initAuth() {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse
    });
}

function handleCredentialResponse(response) {
    if (response.credential) {
        // Decode the credential response
        const payload = parseJwt(response.credential);
        
        // Store user info
        currentUser = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture
        };

        // Update UI
        updateUIForSignedInUser();

        // Store auth token
        localStorage.setItem('authToken', response.credential);
    }
}

function signOut() {
    google.accounts.id.disableAutoSelect();
    currentUser = null;
    localStorage.removeItem('authToken');
    updateUIForSignedOutUser();
}

function updateUIForSignedInUser() {
    document.getElementById('signInButton').classList.add('d-none');
    document.getElementById('userProfile').classList.remove('d-none');
    document.getElementById('userAvatar').src = currentUser.picture;
    document.getElementById('userName').textContent = currentUser.name;
}

function updateUIForSignedOutUser() {
    document.getElementById('signInButton').classList.remove('d-none');
    document.getElementById('userProfile').classList.add('d-none');
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Event Listeners
document.getElementById('signInButton').addEventListener('click', () => {
    google.accounts.id.prompt();
});

document.getElementById('signOutButton').addEventListener('click', signOut);

// Initialize on load
window.onload = initAuth;

// Export for use in other scripts
window.getCurrentUser = () => currentUser;
