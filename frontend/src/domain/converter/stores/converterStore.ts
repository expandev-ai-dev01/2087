import { create } from 'zustand';
import type { ConversionResult, ConversionStatus } from '../types/models';

interface ConverterStore {
  file: File | null;
  result: ConversionResult | null;
  status: ConversionStatus;

  setFile: (file: File | null) => void;
  setResult: (result: ConversionResult | null) => void;
  setStatus: (status: ConversionStatus) => void;
  reset: () => void;
}

const initialState = {
  file: null,
  result: null,
  status: { status: 'idle' as const },
};

export const useConverterStore = create<ConverterStore>((set) => ({
  ...initialState,

  setFile: (file) => set({ file }),
  setResult: (result) => set({ result }),
  setStatus: (status) => set({ status }),
  reset: () => set(initialState),
}));
