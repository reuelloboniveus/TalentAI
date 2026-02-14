import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Login with Google
    const login = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    // Logout
    const logout = () => {
        return signOut(auth);
    };

    // Check and Reset Daily Limit
    const checkAndResetLimit = async (userDocRef, data) => {
        const lastReset = data.lastReset?.toDate();
        const today = new Date();

        // Check if last reset was on a different day
        if (!lastReset || lastReset.getDate() !== today.getDate() || lastReset.getMonth() !== today.getMonth() || lastReset.getFullYear() !== today.getFullYear()) {
            await updateDoc(userDocRef, {
                dailyUsage: 0,
                lastReset: serverTimestamp()
            });
            return { ...data, dailyUsage: 0 };
        }
        return data;
    };

    // Increment Usage
    const incrementUsage = async () => {
        if (!currentUser) return false;
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
            dailyUsage: increment(1)
        });
        setUserData(prev => ({ ...prev, dailyUsage: (prev?.dailyUsage || 0) + 1 }));
        return true;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch or Create User Data in Firestore
                const userDocRef = doc(db, 'users', user.uid);
                const userSnapshot = await getDoc(userDocRef);

                if (userSnapshot.exists()) {
                    let data = userSnapshot.data();
                    data = await checkAndResetLimit(userDocRef, data);
                    setUserData(data);
                } else {
                    // Initialize new user
                    const newData = {
                        uid: user.uid,
                        email: user.email,
                        role: 'user', // Default role
                        dailyUsage: 0,
                        limit: 10,
                        lastReset: serverTimestamp()
                    };
                    await setDoc(userDocRef, newData);
                    setUserData(newData);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        login,
        logout,
        incrementUsage,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
