// store/farmerStore.ts
import { Farmer, FarmerState } from "@/types";
import { create } from "zustand";





export const useFarmerStore = create<FarmerState>((set) => ({
  farmerInfo: {
    farmer: null,
    accessToken: null,
  },

  setFarmerInfo: (farmer, accessToken) =>
    set({
      farmerInfo: { farmer, accessToken },
    }),

  clearFarmerInfo: () =>
    set({
      farmerInfo: { farmer: null, accessToken: null },
    }),
}));
