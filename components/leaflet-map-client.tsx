"use client"

"use client"

import { useState } from "react"
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"

import MapLegend from "./map-legend"
import ATMHoverCard from "./atm-hover-card"

interface LeafletMapClientProps {
  activeLayers: {
    population: boolean
    competitors: boolean
    pois: boolean
    coverage: boolean
  }
  simulationMode: boolean
  onLocationSelect: (location: { lng: number; lat: number; address?: string }) => void
  selectedATM?: any | null
  onATMSelect?: (atm: any) => void
}

const mockATMs = [
  // Casablanca Region
  {
    id: 1,
    lng: -7.5898,
    lat: 33.5731,
    name: "ATM Casablanca Centre",
    type: "existing",
    performance: 85,
    brand: "BMCE",
    address: "Boulevard Mohammed V, Casablanca",
    dailyTransactions: 245,
    uptime: "98.2%",
    lastMaintenance: "2024-01-15",
    cashLevel: "Optimal",
    networkStatus: "Connecté",
    city: "Casablanca",
    region: "Casablanca-Settat",
  },
  {
    id: 2,
    lng: -7.6031,
    lat: 33.5891,
    name: "ATM Casablanca Maarif",
    type: "existing",
    performance: 78,
    brand: "Attijariwafa",
    address: "Quartier Maarif, Casablanca",
    dailyTransactions: 198,
    uptime: "96.8%",
    lastMaintenance: "2024-01-12",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Casablanca",
    region: "Casablanca-Settat",
  },
  {
    id: 3,
    lng: -7.5756,
    lat: 33.5642,
    name: "ATM Casablanca Ain Diab",
    type: "existing",
    performance: 92,
    brand: "CIH",
    address: "Corniche Ain Diab, Casablanca",
    dailyTransactions: 287,
    uptime: "99.1%",
    lastMaintenance: "2024-01-20",
    cashLevel: "Optimal",
    networkStatus: "Connecté",
    city: "Casablanca",
    region: "Casablanca-Settat",
  },

  // Rabat Region
  {
    id: 4,
    lng: -6.8498,
    lat: 34.0209,
    name: "ATM Rabat Agdal",
    type: "existing",
    performance: 92,
    brand: "Attijariwafa",
    address: "Avenue Allal Ben Abdellah, Agdal, Rabat",
    dailyTransactions: 312,
    uptime: "99.1%",
    lastMaintenance: "2024-01-20",
    cashLevel: "Optimal",
    networkStatus: "Connecté",
    city: "Rabat",
    region: "Rabat-Salé-Kénitra",
  },
  {
    id: 5,
    lng: -6.8356,
    lat: 34.0142,
    name: "ATM Rabat Hassan",
    type: "existing",
    performance: 88,
    brand: "BMCI",
    address: "Avenue Hassan II, Rabat",
    dailyTransactions: 267,
    uptime: "97.8%",
    lastMaintenance: "2024-01-18",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Rabat",
    region: "Rabat-Salé-Kénitra",
  },
  {
    id: 6,
    lng: -6.7722,
    lat: 34.0531,
    name: "ATM Salé Médina",
    type: "existing",
    performance: 74,
    brand: "Crédit du Maroc",
    address: "Médina de Salé",
    dailyTransactions: 156,
    uptime: "94.5%",
    lastMaintenance: "2024-01-10",
    cashLevel: "Faible",
    networkStatus: "Instable",
    city: "Salé",
    region: "Rabat-Salé-Kénitra",
  },

  // Marrakech Region
  {
    id: 7,
    lng: -8.0081,
    lat: 31.6295,
    name: "ATM Marrakech Gueliz",
    type: "existing",
    performance: 88,
    brand: "BMCI",
    address: "Avenue Mohammed VI, Gueliz, Marrakech",
    dailyTransactions: 278,
    uptime: "97.5%",
    lastMaintenance: "2024-01-18",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Marrakech",
    region: "Marrakech-Safi",
  },
  {
    id: 8,
    lng: -7.9811,
    lat: 31.634,
    name: "ATM Marrakech Médina",
    type: "existing",
    performance: 82,
    brand: "Banque Populaire",
    address: "Place Jemaa el-Fna, Médina, Marrakech",
    dailyTransactions: 234,
    uptime: "96.2%",
    lastMaintenance: "2024-01-16",
    cashLevel: "Optimal",
    networkStatus: "Connecté",
    city: "Marrakech",
    region: "Marrakech-Safi",
  },

  // Agadir Region
  {
    id: 9,
    lng: -9.5981,
    lat: 30.4278,
    name: "ATM Agadir Marina",
    type: "existing",
    performance: 78,
    brand: "CIH",
    address: "Marina d'Agadir, Agadir",
    dailyTransactions: 189,
    uptime: "95.8%",
    lastMaintenance: "2024-01-10",
    cashLevel: "Faible",
    networkStatus: "Instable",
    city: "Agadir",
    region: "Souss-Massa",
  },
  {
    id: 10,
    lng: -9.5698,
    lat: 30.4202,
    name: "ATM Agadir Centre",
    type: "existing",
    performance: 85,
    brand: "BMCE",
    address: "Avenue Hassan II, Agadir",
    dailyTransactions: 221,
    uptime: "97.1%",
    lastMaintenance: "2024-01-14",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Agadir",
    region: "Souss-Massa",
  },

  // Fès Region
  {
    id: 11,
    lng: -4.9998,
    lat: 34.0331,
    name: "ATM Fès Médina",
    type: "existing",
    performance: 75,
    brand: "Crédit du Maroc",
    address: "Place R'cif, Médina, Fès",
    dailyTransactions: 156,
    uptime: "94.3%",
    lastMaintenance: "2024-01-08",
    cashLevel: "Critique",
    networkStatus: "Déconnecté",
    city: "Fès",
    region: "Fès-Meknès",
  },
  {
    id: 12,
    lng: -5.0003,
    lat: 34.0181,
    name: "ATM Fès Ville Nouvelle",
    type: "existing",
    performance: 89,
    brand: "Attijariwafa",
    address: "Avenue Hassan II, Ville Nouvelle, Fès",
    dailyTransactions: 267,
    uptime: "98.4%",
    lastMaintenance: "2024-01-19",
    cashLevel: "Optimal",
    networkStatus: "Connecté",
    city: "Fès",
    region: "Fès-Meknès",
  },

  // Meknès
  {
    id: 13,
    lng: -5.5407,
    lat: 33.8935,
    name: "ATM Meknès Centre",
    type: "existing",
    performance: 81,
    brand: "BMCI",
    address: "Place El Hedim, Meknès",
    dailyTransactions: 203,
    uptime: "96.7%",
    lastMaintenance: "2024-01-13",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Meknès",
    region: "Fès-Meknès",
  },

  // Tanger Region
  {
    id: 14,
    lng: -5.834,
    lat: 35.7595,
    name: "ATM Tanger Ville",
    type: "existing",
    performance: 87,
    brand: "CIH",
    address: "Boulevard Pasteur, Tanger",
    dailyTransactions: 245,
    uptime: "97.9%",
    lastMaintenance: "2024-01-17",
    cashLevel: "Optimal",
    networkStatus: "Connecté",
    city: "Tanger",
    region: "Tanger-Tétouan-Al Hoceïma",
  },
  {
    id: 15,
    lng: -5.8027,
    lat: 35.7473,
    name: "ATM Tanger Médina",
    type: "existing",
    performance: 79,
    brand: "Banque Populaire",
    address: "Grand Socco, Médina, Tanger",
    dailyTransactions: 187,
    uptime: "95.6%",
    lastMaintenance: "2024-01-11",
    cashLevel: "Faible",
    networkStatus: "Connecté",
    city: "Tanger",
    region: "Tanger-Tétouan-Al Hoceïma",
  },

  // Tétouan
  {
    id: 16,
    lng: -5.3684,
    lat: 35.5889,
    name: "ATM Tétouan Centre",
    type: "existing",
    performance: 76,
    brand: "Crédit Agricole",
    address: "Place Hassan II, Tétouan",
    dailyTransactions: 167,
    uptime: "94.8%",
    lastMaintenance: "2024-01-09",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Tétouan",
    region: "Tanger-Tétouan-Al Hoceïma",
  },

  // Oujda Region
  {
    id: 17,
    lng: -1.9085,
    lat: 34.6814,
    name: "ATM Oujda Centre",
    type: "existing",
    performance: 83,
    brand: "BMCE",
    address: "Boulevard Mohammed V, Oujda",
    dailyTransactions: 198,
    uptime: "96.9%",
    lastMaintenance: "2024-01-15",
    cashLevel: "Optimal",
    networkStatus: "Connecté",
    city: "Oujda",
    region: "Oriental",
  },

  // Kenitra
  {
    id: 18,
    lng: -6.5802,
    lat: 34.261,
    name: "ATM Kenitra Ville",
    type: "existing",
    performance: 80,
    brand: "Attijariwafa",
    address: "Avenue Mohammed V, Kenitra",
    dailyTransactions: 189,
    uptime: "96.1%",
    lastMaintenance: "2024-01-12",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Kenitra",
    region: "Rabat-Salé-Kénitra",
  },

  // El Jadida
  {
    id: 19,
    lng: -8.5069,
    lat: 33.2316,
    name: "ATM El Jadida Port",
    type: "existing",
    performance: 77,
    brand: "CIH",
    address: "Cité Portugaise, El Jadida",
    dailyTransactions: 156,
    uptime: "95.2%",
    lastMaintenance: "2024-01-08",
    cashLevel: "Faible",
    networkStatus: "Connecté",
    city: "El Jadida",
    region: "Casablanca-Settat",
  },

  // Safi
  {
    id: 20,
    lng: -9.2372,
    lat: 32.2994,
    name: "ATM Safi Centre",
    type: "existing",
    performance: 74,
    brand: "Banque Populaire",
    address: "Place Mohammed V, Safi",
    dailyTransactions: 143,
    uptime: "93.8%",
    lastMaintenance: "2024-01-07",
    cashLevel: "Critique",
    networkStatus: "Instable",
    city: "Safi",
    region: "Marrakech-Safi",
  },

  // Beni Mellal
  {
    id: 21,
    lng: -6.3498,
    lat: 32.3373,
    name: "ATM Beni Mellal Centre",
    type: "existing",
    performance: 82,
    brand: "BMCI",
    address: "Avenue Hassan II, Beni Mellal",
    dailyTransactions: 178,
    uptime: "96.5%",
    lastMaintenance: "2024-01-14",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Beni Mellal",
    region: "Béni Mellal-Khénifra",
  },

  // Nador
  {
    id: 22,
    lng: -2.9287,
    lat: 35.1681,
    name: "ATM Nador Port",
    type: "existing",
    performance: 78,
    brand: "Crédit du Maroc",
    address: "Boulevard Hassan II, Nador",
    dailyTransactions: 167,
    uptime: "95.4%",
    lastMaintenance: "2024-01-10",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Nador",
    region: "Oriental",
  },

  // Khouribga
  {
    id: 23,
    lng: -6.9063,
    lat: 32.8811,
    name: "ATM Khouribga Centre",
    type: "existing",
    performance: 75,
    brand: "Attijariwafa",
    address: "Avenue Mohammed V, Khouribga",
    dailyTransactions: 154,
    uptime: "94.6%",
    lastMaintenance: "2024-01-09",
    cashLevel: "Faible",
    networkStatus: "Connecté",
    city: "Khouribga",
    region: "Casablanca-Settat",
  },

  // Settat
  {
    id: 24,
    lng: -7.616,
    lat: 33.0013,
    name: "ATM Settat Centre",
    type: "existing",
    performance: 79,
    brand: "BMCE",
    address: "Place Hassan II, Settat",
    dailyTransactions: 165,
    uptime: "95.7%",
    lastMaintenance: "2024-01-11",
    cashLevel: "Bon",
    networkStatus: "Connecté",
    city: "Settat",
    region: "Casablanca-Settat",
  },

  // Larache
  {
    id: 25,
    lng: -6.1563,
    lat: 35.1932,
    name: "ATM Larache Centre",
    type: "existing",
    performance: 73,
    brand: "CIH",
    address: "Place de la Libération, Larache",
    dailyTransactions: 134,
    uptime: "93.2%",
    lastMaintenance: "2024-01-06",
    cashLevel: "Critique",
    networkStatus: "Instable",
    city: "Larache",
    region: "Tanger-Tétouan-Al Hoceïma",
  },
]

const mockCompetitors = [
  // Casablanca
  {
    id: 1,
    lng: -7.595,
    lat: 33.578,
    name: "Banque Populaire Maarif",
    type: "bank",
    category: "Banques",
    city: "Casablanca",
    marketShare: 15.2,
    services: ["ATM", "Agence", "Conseil"],
  },
  {
    id: 2,
    lng: -7.585,
    lat: 33.57,
    name: "Crédit Agricole Anfa",
    type: "bank",
    category: "Banques",
    city: "Casablanca",
    marketShare: 12.8,
    services: ["ATM", "Agence"],
  },
  {
    id: 3,
    lng: -7.601,
    lat: 33.589,
    name: "Wafa Assurance Casa",
    type: "insurance",
    category: "Assurances",
    city: "Casablanca",
    marketShare: 8.5,
    services: ["Assurance", "Conseil"],
  },

  // Rabat
  {
    id: 4,
    lng: -6.855,
    lat: 34.025,
    name: "BMCE Bank Agdal",
    type: "bank",
    category: "Banques",
    city: "Rabat",
    marketShare: 18.3,
    services: ["ATM", "Agence", "Private Banking"],
  },
  {
    id: 5,
    lng: -6.84,
    lat: 34.015,
    name: "CDG Capital Rabat",
    type: "bank",
    category: "Banques",
    city: "Rabat",
    marketShare: 11.7,
    services: ["ATM", "Agence", "Corporate"],
  },

  // Marrakech
  {
    id: 6,
    lng: -8.015,
    lat: 31.635,
    name: "Attijariwafa Gueliz",
    type: "bank",
    category: "Banques",
    city: "Marrakech",
    marketShare: 16.9,
    services: ["ATM", "Agence", "Change"],
  },
  {
    id: 7,
    lng: -7.985,
    lat: 31.628,
    name: "Al Amana Microfinance",
    type: "microfinance",
    category: "Microfinance",
    city: "Marrakech",
    marketShare: 5.2,
    services: ["Microcrédit", "Épargne"],
  },

  // Agadir
  {
    id: 8,
    lng: -9.6,
    lat: 30.43,
    name: "CIH Bank Marina",
    type: "bank",
    category: "Banques",
    city: "Agadir",
    marketShare: 13.4,
    services: ["ATM", "Agence", "Tourism Banking"],
  },
  {
    id: 9,
    lng: -9.575,
    lat: 30.425,
    name: "Crédit du Maroc Agadir",
    type: "bank",
    category: "Banques",
    city: "Agadir",
    marketShare: 10.1,
    services: ["ATM", "Agence"],
  },

  // Fès
  {
    id: 10,
    lng: -5.005,
    lat: 34.025,
    name: "BMCI Fès",
    type: "bank",
    category: "Banques",
    city: "Fès",
    marketShare: 14.6,
    services: ["ATM", "Agence", "Islamic Banking"],
  },
  {
    id: 11,
    lng: -4.995,
    lat: 34.03,
    name: "Banque Populaire Médina",
    type: "bank",
    category: "Banques",
    city: "Fès",
    marketShare: 12.3,
    services: ["ATM", "Agence"],
  },

  // Tanger
  {
    id: 12,
    lng: -5.84,
    lat: 35.765,
    name: "Société Générale Tanger",
    type: "bank",
    category: "Banques",
    city: "Tanger",
    marketShare: 9.8,
    services: ["ATM", "Agence", "International"],
  },
  {
    id: 13,
    lng: -5.825,
    lat: 35.755,
    name: "Arab Bank Tanger",
    type: "bank",
    category: "Banques",
    city: "Tanger",
    marketShare: 7.2,
    services: ["ATM", "Agence"],
  },

  // Meknès
  {
    id: 14,
    lng: -5.545,
    lat: 33.898,
    name: "CFG Bank Meknès",
    type: "bank",
    category: "Banques",
    city: "Meknès",
    marketShare: 6.9,
    services: ["ATM", "Agence"],
  },

  // Oujda
  {
    id: 15,
    lng: -1.915,
    lat: 34.685,
    name: "Bank Al-Maghrib Oujda",
    type: "bank",
    category: "Banques",
    city: "Oujda",
    marketShare: 8.7,
    services: ["ATM", "Agence", "Cross-border"],
  },

  // Kenitra
  {
    id: 16,
    lng: -6.585,
    lat: 34.265,
    name: "Crédit Immobilier Kenitra",
    type: "bank",
    category: "Banques",
    city: "Kenitra",
    marketShare: 5.8,
    services: ["ATM", "Immobilier"],
  },

  // Tétouan
  {
    id: 17,
    lng: -5.375,
    lat: 35.595,
    name: "Banque Centrale Populaire",
    type: "bank",
    category: "Banques",
    city: "Tétouan",
    marketShare: 7.4,
    services: ["ATM", "Agence"],
  },

  // El Jadida
  {
    id: 18,
    lng: -8.515,
    lat: 33.235,
    name: "BMCE Bank El Jadida",
    type: "bank",
    category: "Banques",
    city: "El Jadida",
    marketShare: 11.2,
    services: ["ATM", "Agence"],
  },

  // Safi
  {
    id: 19,
    lng: -9.245,
    lat: 32.305,
    name: "CIH Bank Safi",
    type: "bank",
    category: "Banques",
    city: "Safi",
    marketShare: 8.9,
    services: ["ATM", "Agence"],
  },

  // Beni Mellal
  {
    id: 20,
    lng: -6.355,
    lat: 32.342,
    name: "Attijariwafa Beni Mellal",
    type: "bank",
    category: "Banques",
    city: "Beni Mellal",
    marketShare: 9.6,
    services: ["ATM", "Agence", "Agriculture"],
  },
]

const mockPOIs = [
  // Casablanca
  {
    id: 1,
    lng: -7.592,
    lat: 33.575,
    name: "Morocco Mall",
    type: "shopping",
    category: "Commerces",
    city: "Casablanca",
    footTraffic: 45000,
    importance: "high",
  },
  {
    id: 2,
    lng: -7.588,
    lat: 33.572,
    name: "Université Hassan II",
    type: "education",
    category: "Écoles",
    city: "Casablanca",
    footTraffic: 25000,
    importance: "high",
  },
  {
    id: 3,
    lng: -7.58,
    lat: 33.568,
    name: "CHU Ibn Rochd",
    type: "health",
    category: "Santé",
    city: "Casablanca",
    footTraffic: 15000,
    importance: "high",
  },
  {
    id: 4,
    lng: -7.615,
    lat: 33.59,
    name: "Aéroport Mohammed V",
    type: "transport",
    category: "Transport",
    city: "Casablanca",
    footTraffic: 35000,
    importance: "high",
  },
  {
    id: 5,
    lng: -7.605,
    lat: 33.585,
    name: "Marché Central",
    type: "shopping",
    category: "Commerces",
    city: "Casablanca",
    footTraffic: 12000,
    importance: "medium",
  },

  // Rabat
  {
    id: 6,
    lng: -6.852,
    lat: 34.023,
    name: "Gare Rabat Ville",
    type: "transport",
    category: "Transport",
    city: "Rabat",
    footTraffic: 28000,
    importance: "high",
  },
  {
    id: 7,
    lng: -6.845,
    lat: 34.02,
    name: "Université Mohammed V",
    type: "education",
    category: "Écoles",
    city: "Rabat",
    footTraffic: 22000,
    importance: "high",
  },
  {
    id: 8,
    lng: -6.838,
    lat: 34.015,
    name: "Hôpital Ibn Sina",
    type: "health",
    category: "Santé",
    city: "Rabat",
    footTraffic: 18000,
    importance: "high",
  },
  {
    id: 9,
    lng: -6.825,
    lat: 34.005,
    name: "Kasbah des Oudayas",
    type: "tourism",
    category: "Tourisme",
    city: "Rabat",
    footTraffic: 8000,
    importance: "medium",
  },

  // Marrakech
  {
    id: 10,
    lng: -8.01,
    lat: 31.628,
    name: "CHU Marrakech",
    type: "health",
    category: "Santé",
    city: "Marrakech",
    footTraffic: 16000,
    importance: "high",
  },
  {
    id: 11,
    lng: -7.985,
    lat: 31.635,
    name: "Université Cadi Ayyad",
    type: "education",
    category: "Écoles",
    city: "Marrakech",
    footTraffic: 20000,
    importance: "high",
  },
  {
    id: 12,
    lng: -7.981,
    lat: 31.634,
    name: "Place Jemaa el-Fna",
    type: "tourism",
    category: "Tourisme",
    city: "Marrakech",
    footTraffic: 50000,
    importance: "high",
  },
  {
    id: 13,
    lng: -8.005,
    lat: 31.625,
    name: "Gare Marrakech",
    type: "transport",
    category: "Transport",
    city: "Marrakech",
    footTraffic: 15000,
    importance: "medium",
  },

  // Agadir
  {
    id: 14,
    lng: -9.605,
    lat: 30.435,
    name: "Aéroport Agadir",
    type: "transport",
    category: "Transport",
    city: "Agadir",
    footTraffic: 12000,
    importance: "high",
  },
  {
    id: 15,
    lng: -9.595,
    lat: 30.425,
    name: "Souk El Had",
    type: "shopping",
    category: "Commerces",
    city: "Agadir",
    footTraffic: 18000,
    importance: "medium",
  },
  {
    id: 16,
    lng: -9.585,
    lat: 30.42,
    name: "Plage d'Agadir",
    type: "tourism",
    category: "Tourisme",
    city: "Agadir",
    footTraffic: 25000,
    importance: "high",
  },

  // Fès
  {
    id: 17,
    lng: -5.005,
    lat: 34.025,
    name: "Université Sidi Mohamed Ben Abdellah",
    type: "education",
    category: "Écoles",
    city: "Fès",
    footTraffic: 18000,
    importance: "high",
  },
  {
    id: 18,
    lng: -4.995,
    lat: 34.035,
    name: "Médina de Fès",
    type: "tourism",
    category: "Tourisme",
    city: "Fès",
    footTraffic: 15000,
    importance: "high",
  },
  {
    id: 19,
    lng: -5.0,
    lat: 34.02,
    name: "CHU Hassan II",
    type: "health",
    category: "Santé",
    city: "Fès",
    footTraffic: 14000,
    importance: "high",
  },

  // Tanger
  {
    id: 20,
    lng: -5.84,
    lat: 35.765,
    name: "Port Tanger Med",
    type: "transport",
    category: "Transport",
    city: "Tanger",
    footTraffic: 22000,
    importance: "high",
  },
  {
    id: 21,
    lng: -5.825,
    lat: 35.755,
    name: "Université Abdelmalek Essaâdi",
    type: "education",
    category: "Écoles",
    city: "Tanger",
    footTraffic: 16000,
    importance: "high",
  },
  {
    id: 22,
    lng: -5.815,
    lat: 35.75,
    name: "Grand Socco",
    type: "tourism",
    category: "Tourisme",
    city: "Tanger",
    footTraffic: 12000,
    importance: "medium",
  },

  // Meknès
  {
    id: 23,
    lng: -5.545,
    lat: 33.898,
    name: "Université Moulay Ismail",
    type: "education",
    category: "Écoles",
    city: "Meknès",
    footTraffic: 14000,
    importance: "high",
  },
  {
    id: 24,
    lng: -5.535,
    lat: 33.895,
    name: "Mausolée Moulay Ismail",
    type: "tourism",
    category: "Tourisme",
    city: "Meknès",
    footTraffic: 8000,
    importance: "medium",
  },

  // Oujda
  {
    id: 25,
    lng: -1.915,
    lat: 34.685,
    name: "Université Mohammed Premier",
    type: "education",
    category: "Écoles",
    city: "Oujda",
    footTraffic: 12000,
    importance: "high",
  },
  {
    id: 26,
    lng: -1.905,
    lat: 34.68,
    name: "Marché Municipal",
    type: "shopping",
    category: "Commerces",
    city: "Oujda",
    footTraffic: 8000,
    importance: "medium",
  },

  // Kenitra
  {
    id: 27,
    lng: -6.585,
    lat: 34.265,
    name: "Université Ibn Tofail",
    type: "education",
    category: "Écoles",
    city: "Kenitra",
    footTraffic: 15000,
    importance: "high",
  },
  {
    id: 28,
    lng: -6.575,
    lat: 34.26,
    name: "Port de Kenitra",
    type: "transport",
    category: "Transport",
    city: "Kenitra",
    footTraffic: 6000,
    importance: "medium",
  },

  // Tétouan
  {
    id: 29,
    lng: -5.375,
    lat: 35.595,
    name: "Université Abdelmalek Essaâdi Campus",
    type: "education",
    category: "Écoles",
    city: "Tétouan",
    footTraffic: 10000,
    importance: "high",
  },
  {
    id: 30,
    lng: -5.365,
    lat: 35.59,
    name: "Médina de Tétouan",
    type: "tourism",
    category: "Tourisme",
    city: "Tétouan",
    footTraffic: 7000,
    importance: "medium",
  },

  // El Jadida
  {
    id: 31,
    lng: -8.515,
    lat: 33.235,
    name: "Cité Portugaise",
    type: "tourism",
    category: "Tourisme",
    city: "El Jadida",
    footTraffic: 9000,
    importance: "medium",
  },
  {
    id: 32,
    lng: -8.505,
    lat: 33.23,
    name: "Port El Jadida",
    type: "transport",
    category: "Transport",
    city: "El Jadida",
    footTraffic: 5000,
    importance: "medium",
  },

  // Safi
  {
    id: 33,
    lng: -9.245,
    lat: 32.305,
    name: "Port de Safi",
    type: "transport",
    category: "Transport",
    city: "Safi",
    footTraffic: 7000,
    importance: "medium",
  },
  {
    id: 34,
    lng: -9.235,
    lat: 32.3,
    name: "Médina de Safi",
    type: "tourism",
    category: "Tourisme",
    city: "Safi",
    footTraffic: 4000,
    importance: "low",
  },

  // Beni Mellal
  {
    id: 35,
    lng: -6.355,
    lat: 32.342,
    name: "Université Sultan Moulay Slimane",
    type: "education",
    category: "Écoles",
    city: "Beni Mellal",
    footTraffic: 8000,
    importance: "high",
  },
  {
    id: 36,
    lng: -6.345,
    lat: 32.335,
    name: "Marché Hebdomadaire",
    type: "shopping",
    category: "Commerces",
    city: "Beni Mellal",
    footTraffic: 6000,
    importance: "medium",
  },
]

export default function LeafletMapClient({
  activeLayers,
  simulationMode,
  onLocationSelect,
  selectedATM,
  onATMSelect,
}: LeafletMapClientProps) {
  const [simulationPoint, setSimulationPoint] = useState<{ lng: number; lat: number } | null>(null)
  const [hoveredATM, setHoveredATM] = useState<any>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  const handleLocationSelect = (location: { lng: number; lat: number }) => {
    setSimulationPoint(location)
    onLocationSelect(location)
  }

  const getPerformanceColor = (val: number) =>
    val >= 90 ? "#10b981" : val >= 80 ? "#f59e0b" : "#ef4444"

  const getTypeColor = (type: string) =>
    ({
      bank: "#ef4444",
      insurance: "#f59e0b",
      microfinance: "#8b5cf6",
      shopping: "#10b981",
      education: "#3b82f6",
      transport: "#f59e0b",
      health: "#ef4444",
      tourism: "#6366f1",
    }[type] ?? "#6b7280")

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        if (simulationMode && e?.latlng) handleLocationSelect(e.latlng)
      },
    })
    return null
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative" style={{ minHeight: "500px" }}>
      <MapContainer
        center={[31.7917, -7.0926]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />

        <MapEvents />

        {/* ATMs */}
        {mockATMs.map((atm) => (
          <CircleMarker
            key={`atm-${atm.id}`}
            center={[atm.lat, atm.lng]}
            radius={Math.max(8, atm.performance / 10)}
            pathOptions={{
              fillColor:
                selectedATM?.id === atm.id ? "#fde047" : getPerformanceColor(atm.performance),
              color: selectedATM?.id === atm.id ? "#facc15" : "#ffffff",
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.8,
            }}
            eventHandlers={{
              click: (e) => {
                onATMSelect?.(atm)
                e.target.openPopup()
              },
              mouseover: (e) => {
                const map = e.target._map
                if (map && e.originalEvent) {
                  const pt = map.mouseEventToContainerPoint(e.originalEvent)
                  const rect = map.getContainer().getBoundingClientRect()
                  setHoverPosition({
                    x: rect.left + pt.x + window.scrollX,
                    y: rect.top + pt.y + window.scrollY,
                  })
                  setHoveredATM({ ...atm, type: "atm" })
                }
                e.target.setStyle({ fillOpacity: 1, color: "#000000" })
              },
              mouseout: (e) => {
                setHoveredATM(null)
                e.target.setStyle({ fillOpacity: 0.8, color: "#ffffff" })
              },
            }}
          >
            <Popup>
              <strong>{atm.name}</strong>
              <br />
              {atm.address}
            </Popup>
          </CircleMarker>
        ))}

        {/* Competitors */}
        {activeLayers.competitors &&
          mockCompetitors.map((comp) => (
            <CircleMarker
              key={`comp-${comp.id}`}
              center={[comp.lat, comp.lng]}
              radius={10}
              pathOptions={{
                fillColor: getTypeColor(comp.type),
                color: "#ffffff",
                weight: 2,
                opacity: 0.7,
                fillOpacity: 0.7,
              }}
              eventHandlers={{
                mouseover: (e) => {
                  const map = e.target._map
                  if (map && e.originalEvent) {
                    const pt = map.mouseEventToContainerPoint(e.originalEvent)
                    const rect = map.getContainer().getBoundingClientRect()
                    setHoverPosition({ x: rect.left + pt.x, y: rect.top + pt.y })
                    setHoveredATM({ ...comp, type: "competitor" })
                  }
                  e.target.setStyle({ fillOpacity: 1, color: "#000000" })
                },
                mouseout: (e) => {
                  setHoveredATM(null)
                  e.target.setStyle({ fillOpacity: 0.7, color: "#ffffff" })
                },
              }}
            >
              <Popup>
                <strong>{comp.name}</strong>
                <br />
                {comp.category}
              </Popup>
            </CircleMarker>
          ))}

        {/* POIs */}
        {activeLayers.pois &&
          mockPOIs.map((poi) => (
            <CircleMarker
              key={`poi-${poi.id}`}
              center={[poi.lat, poi.lng]}
              radius={8}
              pathOptions={{
                fillColor: getTypeColor(poi.type),
                color: "#ffffff",
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.8,
              }}
              eventHandlers={{
                mouseover: (e) => {
                  const map = e.target._map
                  if (map && e.originalEvent) {
                    const pt = map.mouseEventToContainerPoint(e.originalEvent)
                    const rect = map.getContainer().getBoundingClientRect()
                    setHoverPosition({ x: rect.left + pt.x, y: rect.top + pt.y })
                    setHoveredATM({ ...poi, type: "poi" })
                  }
                  e.target.setStyle({ fillOpacity: 1, color: "#000000" })
                },
                mouseout: (e) => {
                  setHoveredATM(null)
                  e.target.setStyle({ fillOpacity: 0.8, color: "#ffffff" })
                },
              }}
            >
              <Popup>
                <strong>{poi.name}</strong>
                <br />
                {poi.category}
              </Popup>
            </CircleMarker>
          ))}

        {/* Simulation */}
        {simulationMode && simulationPoint && (
          <CircleMarker
            key={`${simulationPoint.lat},${simulationPoint.lng}`}
            center={[simulationPoint.lat, simulationPoint.lng]}
            radius={12}
            pathOptions={{
              fillColor: "#6366f1",
              color: "#ffffff",
              weight: 3,
              opacity: 1,
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <strong>Point de simulation</strong>
              <br />
              Lat: {simulationPoint.lat.toFixed(4)}, Lng: {simulationPoint.lng.toFixed(4)}
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>

      <MapLegend />
      <ATMHoverCard atm={hoveredATM} position={hoverPosition} visible={!!hoveredATM && !selectedATM} />
    </div>
  )
}