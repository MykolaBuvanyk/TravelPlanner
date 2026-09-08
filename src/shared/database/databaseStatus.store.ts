import { create } from 'zustand';

export const useDatabaseStatus = create<{
  writeError: boolean;
  setWriteError: (value: boolean) => void;
}>(set => ({
  writeError: false,
  setWriteError: writeError => set({ writeError }),
}));
