"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { ref, get, set, child } from "firebase/database";
import { auth, db, googleProvider } from "@/lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Helper: fetch user role with a 3-second timeout so it never hangs
async function fetchUserRole(uid) {
    try {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 3000)
        );
        const snapshot = await Promise.race([
            get(child(ref(db), "users/" + uid)),
            timeout,
        ]);
        return snapshot.exists() ? snapshot.val().role || "faculty" : "faculty";
    } catch {
        return "faculty"; // default on error or timeout
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState("faculty");

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            // Set user immediately — don't block on DB call
            setUser(firebaseUser || null);
            setLoading(false);

            // Fetch role in the background (non-blocking)
            if (firebaseUser && db) {
                fetchUserRole(firebaseUser.uid).then(setUserRole);
            } else {
                setUserRole("faculty");
            }
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth || !googleProvider) throw new Error("Firebase not initialized");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setUser(result.user);
            // Save user to DB in background
            if (db) {
                get(child(ref(db), "users/" + result.user.uid)).then((snap) => {
                    if (!snap.exists()) {
                        set(ref(db, "users/" + result.user.uid), {
                            name: result.user.displayName,
                            email: result.user.email,
                            photoURL: result.user.photoURL,
                            role: "faculty",
                            department: "",
                            createdAt: new Date().toISOString(),
                        }).catch(() => { });
                    }
                }).catch(() => { });
            }
            return result.user;
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    };

    const signUpWithEmail = async (email, password, name) => {
        if (!auth) throw new Error("Firebase not initialized");
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            setUser(result.user);
            // Save user to DB in background
            if (db) {
                set(ref(db, "users/" + result.user.uid), {
                    name: name || email.split("@")[0],
                    email: result.user.email,
                    photoURL: null,
                    role: "faculty",
                    department: "",
                    createdAt: new Date().toISOString(),
                }).catch(() => { });
            }
            return result.user;
        } catch (error) {
            console.error("Email Sign-Up Error:", error);
            throw error;
        }
    };

    const loginWithEmail = async (email, password) => {
        if (!auth) throw new Error("Firebase not initialized");
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            setUser(result.user);
            return result.user;
        } catch (error) {
            console.error("Email Login Error:", error);
            throw error;
        }
    };

    const signOut = async () => {
        if (!auth) {
            setUser(null);
            setUserRole("faculty");
            return;
        }
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setUserRole("faculty");
        } catch (error) {
            console.error("Sign-Out Error:", error);
            throw error;
        }
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                userRole,
                signInWithGoogle,
                signUpWithEmail,
                loginWithEmail,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
