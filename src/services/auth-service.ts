
'use client';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  AuthError,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Directly import the initialized auth instance
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

type AuthResult = {
    user?: User | null;
    error?: AuthError | null;
}

export const handleGoogleSignIn = async (): Promise<AuthResult> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // On Google sign-in, save/update user data in Firestore
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });
    }
    return { user };
  } catch (error) {
    return { error: error as AuthError };
  }
};

export const handleEmailPasswordSignUp = async (email: string, password: string, displayName: string): Promise<AuthResult> => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        // Update Firebase Auth profile
        await updateProfile(user, { displayName });
        
        // Save user info to Firestore on signup
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        }, { merge: true });

        return { user };
    } catch (error) {
        return { error: error as AuthError };
    }
}

export const handleEmailPasswordSignIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
         if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        }
        return { user: result.user };
    } catch (error) {
        return { error: error as AuthError };
    }
}

export const handleSignOut = async (): Promise<{error?: AuthError | null}> => {
  try {
    await signOut(auth);
    return {};
  } catch (error) {
    return { error: error as AuthError };
  }
};

export const handlePasswordResetRequest = async (email: string): Promise<{error?: AuthError | null}> => {
    try {
        await sendPasswordResetEmail(auth, email, {
             url: `${window.location.origin}/auth/reset-password`,
        });
        return {};
    } catch (error) {
        return { error: error as AuthError };
    }
}

export const handleVerifyResetCode = async (code: string): Promise<{email?: string, error?: AuthError | null}> => {
    try {
        const email = await verifyPasswordResetCode(auth, code);
        return { email };
    } catch (error) {
        return { error: error as AuthError };
    }
}

export const handleConfirmPasswordReset = async (code: string, newPassword: string):Promise<{error?: AuthError | null}> => {
    try {
        await confirmPasswordReset(auth, code, newPassword);
        return {};
    } catch (error) {
        return { error: error as AuthError };
    }
}
