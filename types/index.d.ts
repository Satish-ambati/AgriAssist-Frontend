// --------------------------------INTERFACES--------------------------
export interface Farmer {
  _id: string;
  name: string;
  phonenumber: string;
  language?: "telugu" | "hindi" | "english";

  location?: {
    state?: string;
    district?: string;
    mandal?: string;
    village?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };

  isVerified?: boolean;

  farmProfiles?: string[]; // array of ObjectIds (Farm references)

  preferences?: {
    notifications?: {
      disease?: boolean;
      fertilizer?: boolean;
      irrigation?: boolean;
      market?: boolean;
    };
    units?: {
      area?: "acre" | "hectare";
      weight?: "kg" | "quintal";
    };
  };

  createdAt?: string;
  updatedAt?: string;
}


interface FarmerState {
  farmerInfo: {
    farmer: Farmer | null;
    accessToken: string | null;
  };
  setFarmerInfo: (farmer: Farmer, accessToken: string) => void;
  clearFarmerInfo: () => void;
}

export interface LocationData {
  state: string;
  district: string;
  mandal: string;
  village: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// -----------------------------TYPES-----------------------------