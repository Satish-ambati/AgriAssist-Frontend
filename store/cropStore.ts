import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { Api } from '@/app/api';
import { useFarmerStore } from '.';

export interface FertilizerSchedule {
  date?: string | Date;
  type?: string;
  quantity?: number;
  unit?: string;
  applied?: boolean;
}

export interface IrrigationSchedule {
  date?: string | Date;
  duration?: number;
  method?: string;
  applied?: boolean;
}

export interface AiRecommendations {
  initialPlan: {
    fertilizerSchedule: FertilizerSchedule[];
    irrigationSchedule: IrrigationSchedule[];
  };
}

export interface Timeline {
  sowingDate: string | Date;
  expectedHarvestDate: string | Date;
  actualHarvestDate?: string | Date;
  duration: number;
}

export interface Expenses {
  seeds?: number;
  fertilizers?: number;
  pesticides?: number;
  irrigation?: number;
  labor?: number;
  other?: number;
  total?: number;
}

export interface Yield {
  expected?: number;
  actual?: number;
  unit?: string;
  quality?: string;
}

export interface Crop {
  _id: string;
  farm: string;
  farmer: string;
  crop: {
    name: string;
    variety?: string;
    category?: 'Cereal' | 'Pulse' | 'Oilseed' | 'Vegetable' | 'Fruit' | 'Cash Crop';
  };
  season: 'Kharif' | 'Rabi' | 'Zaid';
  cropStage: 'Planning' | 'Sowing' | 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturity' | 'Harvested';
  timeline: Timeline;
  aiRecommendations?: AiRecommendations;
  expenses?: Expenses;
  yield?: Yield;
  status: 'Active' | 'Completed' | 'Failed';
  createdAt: string;
  updatedAt: string;
  confidence ?: number ;
  reason ?: string;
}

interface CropStore {
  crops: Crop[];
  fetchCrops: (farmerId : string | undefined) => Promise<void>;
  addCrop: (newCrop: Crop) => void;
  updateCrop: (updatedCrop: Crop) => void;
  removeCrop: (id: string) => void;
  createCrop: (farmerId: string, cropData: any) => Promise<Crop>; // <-- new

}

export const useCropStore = create<CropStore>()(
  
  devtools((set, get) => ({
    crops: [],

    fetchCrops: async (farmerId?: string) => {
      if (!farmerId) throw new Error("Farmer ID is required");

      try {
        const res = await axios.get(`${Api}/api/crop-cycle/get-all-crop-cycles/${farmerId}`);
        set({ crops: res.data.allCycles });
      } catch (err) {
        console.error("Failed to fetch crops:", err);
      }
    },

    addCrop: (newCrop) => {
      set((state) => ({ crops: [...state.crops, newCrop] }));
    },

    createCrop: async (farmerId: string, cropData: any) => {
      try {
        const res = await axios.post(`${Api}/api/crop-cycle/create`, {
          farmerId,
          cropData,
        });

        set((state) => ({
          crops: [...state.crops, res.data.crop], // update store instantly
        }));

        return res.data.crop;
      } catch (err) {
        console.error("Failed to create crop:", err);
        throw err;
      }
    },


    updateCrop: (updatedCrop) => {
      set((state) => ({
        crops: state.crops.map((crop) =>
          crop._id === updatedCrop._id ? updatedCrop : crop
        ),
      }));
    },

    removeCrop: (id) => {
      set((state) => ({
        crops: state.crops.filter((crop) => crop._id !== id),
      }));
    },
  }))
);
