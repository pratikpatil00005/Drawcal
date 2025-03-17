import { auth } from '../../backend/services/firebaseService.js';
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const signInButton = document.getElementById('signInButton');
    const userProfile = document.getElementById('userProfile');
    const signOutButton = document.getElementById('signOutButton');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');

    const provider = new GoogleAuthProvider();

    signInButton?.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log('Sign in successful:', result.user);
        } catch (error) {
            console.error('Sign in error:', error);
            alert('Failed to sign in. Please try again.');
        }
    });

    signOutButton?.addEventListener('click', async () => {
        try {
            await auth.signOut();
            console.log('Sign out successful');
        } catch (error) {
            console.error('Sign out error:', error);
            alert('Failed to sign out. Please try again.');
        }
    });

    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            signInButton?.classList.add('d-none');
            userProfile?.classList.remove('d-none');
            if (userAvatar) userAvatar.src = user.photoURL || 'images/default-avatar.png';
            if (userName) userName.textContent = user.displayName || 'User';
        } else {
            signInButton?.classList.remove('d-none');
            userProfile?.classList.add('d-none');
            if (userAvatar) userAvatar.src = '';
            if (userName) userName.textContent = '';
        }
    });
});