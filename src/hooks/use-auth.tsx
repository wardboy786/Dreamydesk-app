
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  premiumUntil: Date | null;
  setIsPremium: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true, 
    isPremium: false,
    premiumUntil: null,
    setIsPremium: () => {} 
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(null);
  
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setIsPremium(false);
        setPremiumUntil(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const premiumStatus = data.isPremium === true;
          const untilDate = data.premiumUntil instanceof Timestamp ? data.premiumUntil.toDate() : null;

          if (premiumStatus && untilDate && untilDate > new Date()) {
              setIsPremium(true);
              setPremiumUntil(untilDate);
          } else {
              setIsPremium(false);
              setPremiumUntil(null);
          }

        } else {
          setIsPremium(false);
          setPremiumUntil(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error listening to user document:", error);
        setIsPremium(false);
        setPremiumUntil(null);
        setLoading(false);
      });
      
      return () => unsubscribeFirestore();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, isPremium, premiumUntil, setIsPremium }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
