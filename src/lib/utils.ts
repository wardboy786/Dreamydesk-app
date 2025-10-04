
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retrieves a unique identifier for a guest user from localStorage,
 * creating one if it doesn't exist. This is a client-side utility.
 * @returns {string} The guest user's unique ID.
 */
export function getGuestId(): string {
    if (typeof window === 'undefined') return 'server_guest';
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
        guestId = uuidv4();
        localStorage.setItem('guestId', guestId);
    }
    return guestId;
}
