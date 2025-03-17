import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js';
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";

const firebaseConfig = {
    // Replace with your Firebase config
    apiKey: "AIzaSyDsJPH37zMe5t0EImKCRU8lbQNbvVns75Y",
    authDomain: "drawcal-f0fb6.firebaseapp.com",
    projectId: "drawcal-f0fb6",
    storageBucket: "drawcal-f0fb6.firebasestorage.app",
    messagingSenderId: "45194500072",
    appId: "1:45194500072:web:150a38cba439c76983f65d",
    measurementId: "G-BX2P4XDWH2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

class FirebaseService {
    async saveCalculation(userId, imageData, result) {
        try {
            const docRef = await addDoc(collection(db, 'calculations'), {
                userId,
                imageData,
                result,
                timestamp: new Date().toISOString()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error saving calculation:', error);
            throw error;
        }
    }

    async getUserHistory(userId) {
        try {
            const q = query(
                collection(db, 'calculations'), 
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching user history:', error);
            throw error;
        }
    }
}

export default new FirebaseService();
