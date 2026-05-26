import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export const logEvent = async (eventType, eventDescription, details = {}) => {
    try {
        const currentUser = auth.currentUser;
        await addDoc(collection(db, 'logs'), {
            userId: currentUser?.uid || 'anonymous',
            userEmail: currentUser?.email || 'anonymous',
            eventType,
            eventDescription,
            details,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error("Failed to log event:", error);
    }
};

export const getSystemLogs = async (limitCount = 150) => {
    try {
        const logsRef = collection(db, 'logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return [];
    }
};
