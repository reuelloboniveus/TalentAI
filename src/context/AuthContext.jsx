import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, getDocs } from 'firebase/firestore';

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
    const incrementUsage = async (amount = 1) => {
        if (!currentUser) return false;
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
            dailyUsage: increment(amount)
        });
        setUserData(prev => ({ ...prev, dailyUsage: (prev?.dailyUsage || 0) + amount }));
        return true;
    };

    const [orgData, setOrgData] = useState(null);

    // Create Organization (Super Admin Only)
    const createOrganization = async (orgName) => {
        if (!currentUser || userData?.role !== 'super_admin') {
            throw new Error("Only Super Admins can create organizations.");
        }

        const orgRef = doc(collection(db, 'organizations'));
        const newOrg = {
            name: orgName,
            ownerId: currentUser.uid,
            createdAt: serverTimestamp(),
            geminiApiKey: ''
        };

        await setDoc(orgRef, newOrg);
        return orgRef.id;
    };

    // Super Admin: Assign User to Org (creates doc if user hasn't signed in yet)
    const assignUserToOrg = async (targetUserId, targetOrgId, role = 'recruiter') => {
        if (userData?.role !== 'super_admin') throw new Error("Unauthorized");
        const userRef = doc(db, 'users', targetUserId);
        await setDoc(userRef, { 
            orgId: targetOrgId, 
            role: role,
            email: targetUserId.includes('@') ? targetUserId : null,
            dailyUsage: 0,
            limit: 10,
            lastReset: serverTimestamp()
        }, { merge: true });
    };

    // Super Admin: Remove User from Org
    const removeUserFromOrg = async (targetUserId) => {
        if (userData?.role !== 'super_admin') throw new Error("Unauthorized");
        const userRef = doc(db, 'users', targetUserId);
        await updateDoc(userRef, { orgId: null }); // Or use deleteField() if imported
    };

    // Update Organization Settings (API Key)
    const updateOrgSettings = async (apiKey) => {
        if (!userData?.orgId) throw new Error("No organization found.");
        const orgRef = doc(db, 'organizations', userData.orgId);
        await updateDoc(orgRef, {
            geminiApiKey: apiKey
        });
        setOrgData(prev => ({ ...prev, geminiApiKey: apiKey }));
    };

    // Super Admin: Fetch All Orgs
    const getAllOrgs = async () => {
        if (userData?.role !== 'super_admin') throw new Error("Unauthorized");
        const snapshot = await getDocs(collection(db, 'organizations'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    // Super Admin: Update Any Org Settings
    const updateAnyOrgSettings = async (orgId, apiKey) => {
        if (userData?.role !== 'super_admin') throw new Error("Unauthorized");
        const orgRef = doc(db, 'organizations', orgId);
        await updateDoc(orgRef, { geminiApiKey: apiKey });
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

                    // Fetch Org Data if exists (for non-super admins) or just current context
                    if (data.orgId) {
                        const orgDoc = await getDoc(doc(db, 'organizations', data.orgId));
                        if (orgDoc.exists()) {
                            setOrgData({ id: orgDoc.id, ...orgDoc.data() });
                        }
                    }
                } else {
                    // Initialize new user
                    const newData = {
                        uid: user.uid,
                        email: user.email,
                        role: 'user', // Default role. Super Admin must be set manually in Firestore console first.
                        dailyUsage: 0,
                        limit: 10,
                        lastReset: serverTimestamp()
                    };
                    await setDoc(userDocRef, newData);
                    setUserData(newData);
                }
            } else {
                setUserData(null);
                setOrgData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        orgData,
        login,
        logout,
        incrementUsage,
        createOrganization,
        updateOrgSettings,
        getAllOrgs,
        updateAnyOrgSettings,
        assignUserToOrg,
        removeUserFromOrg,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
