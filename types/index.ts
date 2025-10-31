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
  id: string;
  bank_name: string | null;
  latitude: number;
  longitude: number;
  commune?: string | null;
  commune_norm?: string | null;
  nb_atm: number;
};

export type CompetitorListResponse = {
  competitors: Competitor[];
  total_count: number;
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