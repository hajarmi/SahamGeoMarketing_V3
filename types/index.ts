export type ATMStatus = "active" | "maintenance" | "inactive" | string;
export type ATMType = "saham" | "competitor" | "poi" | "population" | string;

export type RawATM = {
  id?: string;
  idatm?: string;
  latitude: number;
  longitude: number;
  monthly_volume: number;
  city: string;
  region: string;
  bank_name: string;
  status: string;
  name?: string;
  installation_type?: string;
  services?: string[] | null;
  branch_location?: string;
  type?: ATMType;
  performance?: number;
  uptime?: string;
  roi?: number;
  cashLevel?: string;
  lastMaintenance?: string;
  address?: string;
};

export type ATM = RawATM & {
  id: string;
  name: string;
  installation_type: "fixed" | "portable";
  services: string[];
  branch_location: string;
};


// === GARDER CETTE VERSION-LA ===
export type Competitor = {
  id: string | number;
  latitude: number;
  longitude: number;
  bank_name?: string | null;
  name?: string | null;
  lat?: number;
  lng?: number;
  commune?: string | null;
  commune_norm?: string | null;
  nb_atm?: number;
  type?: string;
  category?: string;
  marketShare?: number;
  services?: string[];
  city?: string;
};

export type CompetitorListResponse = {
  competitors: Competitor[];
  total_count: number;
};

export type POI = {
  id: number | string;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  name: string;
  type: string;
  category: string;
  city?: string | null;
  footTraffic?: number;
  importance?: "high" | "medium" | "low" | string;
  services?: string[];
};

export type PopulationPoint = {
  id: string;
  commune: string | null;
  commune_norm: string;
  latitude: number;
  longitude: number;
  densite_norm: number;
  densite?: number | null;
};

export type PopulationListResponse = {
  population: PopulationPoint[];
  total_count: number;
};
