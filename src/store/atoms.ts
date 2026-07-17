import { atom } from 'jotai';

// Tracks which NFT the user has currently selected in the UI to edit/view
export const selectedTokenIdAtom = atom<number | null>(null);

// Tracks global refresh triggers (e.g., after minting or toggling)
export const refreshTriggerAtom = atom<number>(0);