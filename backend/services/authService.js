import { auth } from './firebaseService';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js';

class AuthService {
    constructor() {
        this.provider = new GoogleAuthProvider();
    }

    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, this.provider);
            return result.user;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    getCurrentUser() {
        return auth.currentUser;
    }
}

export default new AuthService();






