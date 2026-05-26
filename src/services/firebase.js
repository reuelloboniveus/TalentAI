import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { logEvent } from './logger';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "hr-saas-db-prod");
export const googleProvider = new GoogleAuthProvider();

// History Functions
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

export const saveAnalysisToHistory = async (userId, analysisResult) => {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        
        let isBulk = Array.isArray(analysisResult);
        let jdSummary = "";
        let matchScore = 0;

        if (isBulk) {
            // Use the job_role from the first result and count the rest
            const firstResult = analysisResult[0] || {};
            const jobRole = firstResult.job_role || "Requirement";
            jdSummary = `Batch: ${jobRole} (${analysisResult.length} Resumes)`;
            matchScore = Math.max(...analysisResult.map(r => r.score || 0));
        } else {
            const candidateName = analysisResult.candidate_name || "Candidate";
            const jobRole = analysisResult.job_role || "Analysis";
            jdSummary = `${candidateName} | ${jobRole}`;
            matchScore = analysisResult.matchScore || analysisResult.score;
        }

        await addDoc(historyRef, {
            jdSummary,
            matchScore: matchScore,
            result: analysisResult,
            createdAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error saving history:", error);
    }
};

export const getUserHistory = async (userId) => {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const q = query(
            historyRef,
            where('createdAt', '>', Timestamp.fromDate(thirtyDaysAgo)),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};

// JD Library Functions
export const saveJD = async (userId, title, content, orgId = null) => {
    try {
        const jdsRef = orgId 
            ? collection(db, 'organizations', orgId, 'jds') 
            : collection(db, 'users', userId, 'jds');
        const docRef = await addDoc(jdsRef, {
            title,
            content,
            createdAt: Timestamp.now(),
            createdBy: userId
        });
        await logEvent('CREATE_JD_TEMPLATE', `Created Job Description template: ${title}`, { jdId: docRef.id, title, orgId });
        return { id: docRef.id, title, content };
    } catch (error) {
        console.error("Error saving JD:", error);
        await logEvent('CREATE_JD_TEMPLATE_ERROR', `Failed to create JD template: ${error.message}`, { title, orgId });
        throw error;
    }
};

export const getUserJDs = async (userId, orgId = null) => {
    try {
        const jdsRef = orgId 
            ? collection(db, 'organizations', orgId, 'jds') 
            : collection(db, 'users', userId, 'jds');
        const q = query(jdsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching JDs:", error);
        return [];
    }
};

export const deleteJD = async (userId, jdId, orgId = null) => {
    try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const jdRef = orgId 
            ? doc(db, 'organizations', orgId, 'jds', jdId) 
            : doc(db, 'users', userId, 'jds', jdId);
        await deleteDoc(jdRef);
        await logEvent('DELETE_JD_TEMPLATE', `Deleted Job Description template`, { jdId, orgId });
    } catch (error) {
        console.error("Error deleting JD:", error);
        await logEvent('DELETE_JD_TEMPLATE_ERROR', `Failed to delete JD template: ${error.message}`, { jdId, orgId });
        throw error;
    }
};

export const updateJD = async (userId, jdId, title, content, orgId = null) => {
    try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const jdRef = orgId 
            ? doc(db, 'organizations', orgId, 'jds', jdId) 
            : doc(db, 'users', userId, 'jds', jdId);
        await updateDoc(jdRef, {
            title,
            content,
            updatedAt: Timestamp.now(),
            updatedBy: userId
        });
        await logEvent('UPDATE_JD_TEMPLATE', `Updated Job Description template: ${title}`, { jdId, title, orgId });
    } catch (error) {
        console.error("Error updating JD:", error);
        await logEvent('UPDATE_JD_TEMPLATE_ERROR', `Failed to update JD template: ${error.message}`, { jdId, title, orgId });
        throw error;
    }
};

