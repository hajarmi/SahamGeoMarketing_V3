export type ATMStatus = "active" | "maintenance" | "inactive" | string;
export type ATMType = "saham" | "competitor" | "poi" | "population" | string;

export interface ATM { /* … inchangé … */ }

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
