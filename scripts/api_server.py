"""
Saham Bank Geomarketing AI - API Server
FastAPI backend pour la solution de géomarketing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import asyncio
import random
import json
from datetime import datetime
import numpy as np

# Import des modèles ML
from ml_models import ATMLocationPredictor, CanibalizationAnalyzer

app = FastAPI(
    title="Saham Bank Geomarketing AI",
    description="API pour l'optimisation d'implantation d'automates bancaires",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation des modèles
predictor = ATMLocationPredictor()
canibalization_analyzer = CanibalizationAnalyzer()

# Modèles Pydantic pour l'API
class LocationData(BaseModel):
    latitude: float
    longitude: float
    population_density: Optional[float] = 1000
    commercial_poi_count: Optional[int] = 10
    competitor_atms_500m: Optional[int] = 2
    foot_traffic_score: Optional[float] = 50
    income_level: Optional[float] = 45000
    accessibility_score: Optional[float] = 7
    parking_availability: Optional[int] = 1
    public_transport_nearby: Optional[int] = 1
    business_district: Optional[int] = 0
    residential_area: Optional[int] = 1

class ATMData(BaseModel):
    id: str
    latitude: float
    longitude: float
    monthly_volume: Optional[float] = 1000
    status: Optional[str] = "active"
    city: Optional[str] = "Unknown"
    region: Optional[str] = "Unknown"

class PredictionResponse(BaseModel):
    predicted_volume: float
    roi_probability: float
    roi_prediction: bool
    global_score: float
    reason_codes: List[str]
    recommendation: str
    canibalization_analysis: Dict[str, Any]

# Données simulées d'ATMs existants
existing_atms = [
    {"id": "ATM001", "latitude": 33.5731, "longitude": -7.5898, "monthly_volume": 1200, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
    {"id": "ATM002", "latitude": 33.5891, "longitude": -7.6031, "monthly_volume": 950, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Attijariwafa Bank"},
    {"id": "ATM003", "latitude": 33.5642, "longitude": -7.5756, "monthly_volume": 1400, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "BMCE Bank"},
    {"id": "ATM004", "latitude": 33.5923, "longitude": -7.6156, "monthly_volume": 800, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Banque Populaire"},
    {"id": "ATM005", "latitude": 33.5534, "longitude": -7.5634, "monthly_volume": 1100, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "CIH Bank"},
    {"id": "ATMCASA01", "latitude": 33.5951, "longitude": -7.6185, "monthly_volume": 1300, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
    {"id": "ATMCASA02", "latitude": 33.588, "longitude": -7.63, "monthly_volume": 1050, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "BMCI"},
    {"id": "ATMCASA03", "latitude": 33.57, "longitude": -7.65, "monthly_volume": 980, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Crédit du Maroc"},
    {"id": "ATMCASA04", "latitude": 33.53, "longitude": -7.6, "monthly_volume": 1150, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
    {"id": "ATMCASA05", "latitude": 33.6, "longitude": -7.55, "monthly_volume": 1250, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Al Barid Bank"},
    {"id": "ATMCASA06", "latitude": 33.59, "longitude": -7.62, "monthly_volume": 1450, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Attijariwafa Bank"},
    {"id": "ATMCASA07", "latitude": 33.58, "longitude": -7.64, "monthly_volume": 900, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Banque Populaire"},
    {"id": "ATMCASA08", "latitude": 33.56, "longitude": -7.59, "monthly_volume": 1350, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "BMCE Bank"},
    {"id": "ATMCASA09", "latitude": 33.54, "longitude": -7.63, "monthly_volume": 1000, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Crédit Agricole du Maroc"},
    {"id": "ATMCASA10", "latitude": 33.575, "longitude": -7.585, "monthly_volume": 1500, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
    {"id": "ATMCASA11", "latitude": 33.598, "longitude": -7.625, "monthly_volume": 1600, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
    {"id": "ATMCASA12", "latitude": 33.585, "longitude": -7.61, "monthly_volume": 1100, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Société Générale Maroc"},
    {"id": "ATMCASA13", "latitude": 33.572, "longitude": -7.56, "monthly_volume": 1250, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
    {"id": "ATMCASA14", "latitude": 33.545, "longitude": -7.58, "monthly_volume": 950, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Société Générale Maroc"},
    {"id": "ATMCASA15", "latitude": 33.567, "longitude": -7.64, "monthly_volume": 1400, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
    
    {"id": "ATM006", "latitude": 34.0209, "longitude": -6.8498, "monthly_volume": 1350, "city": "Rabat", "region": "Rabat-Salé-Kénitra", "bank_name": "Attijariwafa Bank"},
    {"id": "ATM007", "latitude": 34.0142, "longitude": -6.8356, "monthly_volume": 1180, "city": "Rabat", "region": "Rabat-Salé-Kénitra", "bank_name": "BMCE Bank"},
    {"id": "ATM008", "latitude": 34.0531, "longitude": -6.7722, "monthly_volume": 890, "city": "Salé", "region": "Rabat-Salé-Kénitra", "bank_name": "Banque Populaire"},
    
    {"id": "ATM009", "latitude": 31.6295, "longitude": -8.0081, "monthly_volume": 1250, "city": "Marrakech", "region": "Marrakech-Safi", "bank_name": "CIH Bank"},
    {"id": "ATM010", "latitude": 31.6340, "longitude": -7.9811, "monthly_volume": 1050, "city": "Marrakech", "region": "Marrakech-Safi", "bank_name": "BMCI"},
    
    {"id": "ATM011", "latitude": 30.4278, "longitude": -9.5981, "monthly_volume": 920, "city": "Agadir", "region": "Souss-Massa", "bank_name": "Crédit du Maroc"},
    {"id": "ATM012", "latitude": 30.4202, "longitude": -9.5698, "monthly_volume": 1080, "city": "Agadir", "region": "Souss-Massa", "bank_name": "Attijariwafa Bank"},
    
    {"id": "ATM013", "latitude": 34.0331, "longitude": -4.9998, "monthly_volume": 780, "city": "Fès", "region": "Fès-Meknès", "bank_name": "Banque Populaire"},
    {"id": "ATM014", "latitude": 34.0181, "longitude": -5.0003, "monthly_volume": 1200, "city": "Fès", "region": "Fès-Meknès", "bank_name": "BMCE Bank"},
    
    {"id": "ATM015", "latitude": 35.7595, "longitude": -5.8340, "monthly_volume": 1150, "city": "Tanger", "region": "Tanger-Tétouan-Al Hoceïma", "bank_name": "Attijariwafa Bank"},
    {"id": "ATM016", "latitude": 35.7473, "longitude": -5.8027, "monthly_volume": 890, "city": "Tanger", "region": "Tanger-Tétouan-Al Hoceïma", "bank_name": "BMCI"},
    
    {"id": "ATM017", "latitude": 33.8935, "longitude": -5.5407, "monthly_volume": 950, "city": "Meknès", "region": "Fès-Meknès", "bank_name": "Crédit Agricole du Maroc"},
    {"id": "ATM018", "latitude": 34.6814, "longitude": -1.9085, "monthly_volume": 870, "city": "Oujda", "region": "Oriental", "bank_name": "Banque Populaire"},
    {"id": "ATM019", "latitude": 34.2610, "longitude": -6.5802, "monthly_volume": 820, "city": "Kenitra", "region": "Rabat-Salé-Kénitra", "bank_name": "CIH Bank"},
    {"id": "ATM020", "latitude": 35.5889, "longitude": -5.3684, "monthly_volume": 750, "city": "Tétouan", "region": "Tanger-Tétouan-Al Hoceïma", "bank_name": "BMCE Bank"},
    
    {"id": "ATM021", "latitude": 33.2316, "longitude": -8.5069, "monthly_volume": 680, "city": "El Jadida", "region": "Casablanca-Settat", "bank_name": "Al Barid Bank"},
    {"id": "ATM022", "latitude": 32.2994, "longitude": -9.2372, "monthly_volume": 620, "city": "Safi", "region": "Marrakech-Safi", "bank_name": "Attijariwafa Bank"},
    
    {"id": "ATM023", "latitude": 32.3373, "longitude": -6.3498, "monthly_volume": 780, "city": "Beni Mellal", "region": "Béni Mellal-Khénifra", "bank_name": "Banque Populaire"},
    {"id": "ATM024", "latitude": 35.1681, "longitude": -2.9287, "monthly_volume": 720, "city": "Nador", "region": "Oriental", "bank_name": "BMCE Bank"},
    {"id": "ATM025", "latitude": 32.8811, "longitude": -6.9063, "monthly_volume": 650, "city": "Khouribga", "region": "Casablanca-Settat", "bank_name": "CIH Bank"},

    # Nouveaux ATMs Société Générale
    {"id": "SGRABAT01", "latitude": 34.015, "longitude": -6.83, "monthly_volume": 1100, "city": "Rabat", "region": "Rabat-Salé-Kénitra", "bank_name": "Société Générale Maroc"},
    {"id": "SGMARRA01", "latitude": 31.63, "longitude": -8.0, "monthly_volume": 1300, "city": "Marrakech", "region": "Marrakech-Safi", "bank_name": "Société Générale Maroc"},
    {"id": "SGCASA16", "latitude": 33.58, "longitude": -7.66, "monthly_volume": 1050, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Société Générale Maroc"},
    {"id": "SGTANGER01", "latitude": 35.77, "longitude": -5.82, "monthly_volume": 980, "city": "Tanger", "region": "Tanger-Tétouan-Al Hoceïma", "bank_name": "Société Générale Maroc"},
    {"id": "SGAGADIR01", "latitude": 30.42, "longitude": -9.58, "monthly_volume": 850, "city": "Agadir", "region": "Souss-Massa", "bank_name": "Société Générale Maroc"},

    # Nouveaux ATMs Saham Bank
    {"id": "SAHAMRABAT01", "latitude": 34.018, "longitude": -6.84, "monthly_volume": 1700, "city": "Rabat", "region": "Rabat-Salé-Kénitra", "bank_name": "Saham Bank"},
    {"id": "SAHAMMARRA01", "latitude": 31.635, "longitude": -8.01, "monthly_volume": 1650, "city": "Marrakech", "region": "Marrakech-Safi", "bank_name": "Saham Bank"},
    {"id": "SAHAMTANGER01", "latitude": 35.765, "longitude": -5.81, "monthly_volume": 1550, "city": "Tanger", "region": "Tanger-Tétouan-Al Hoceïma", "bank_name": "Saham Bank"},
    {"id": "SAHAMAGADIR01", "latitude": 30.425, "longitude": -9.59, "monthly_volume": 1450, "city": "Agadir", "region": "Souss-Massa", "bank_name": "Saham Bank"},
    {"id": "SAHAMFES01", "latitude": 34.028, "longitude": -5.005, "monthly_volume": 1300, "city": "Fès", "region": "Fès-Meknès", "bank_name": "Saham Bank"},

    # Expansion du réseau
    {"id": "SAHAMCASA16", "latitude": 33.56, "longitude": -7.66, "monthly_volume": 1900, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
    {"id": "SGCASA17", "latitude": 33.55, "longitude": -7.62, "monthly_volume": 1150, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Société Générale Maroc"},
    {"id": "SAHAMRABAT02", "latitude": 34.00, "longitude": -6.85, "monthly_volume": 1500, "city": "Rabat", "region": "Rabat-Salé-Kénitra", "bank_name": "Saham Bank"},
    {"id": "ATTMARRA02", "latitude": 31.65, "longitude": -8.02, "monthly_volume": 1200, "city": "Marrakech", "region": "Marrakech-Safi", "bank_name": "Attijariwafa Bank"},
    {"id": "SAHAMMEKNES01", "latitude": 33.89, "longitude": -5.56, "monthly_volume": 1250, "city": "Meknès", "region": "Fès-Meknès", "bank_name": "Saham Bank"},
    {"id": "BPOPJDA02", "latitude": 34.67, "longitude": -1.92, "monthly_volume": 950, "city": "Oujda", "region": "Oriental", "bank_name": "Banque Populaire"},
    {"id": "SAHAMKENITRA01", "latitude": 34.25, "longitude": -6.59, "monthly_volume": 1100, "city": "Kenitra", "region": "Rabat-Salé-Kénitra", "bank_name": "Saham Bank"},
    {"id": "CIHTETOUAN02", "latitude": 35.57, "longitude": -5.37, "monthly_volume": 850, "city": "Tétouan", "region": "Tanger-Tétouan-Al Hoceïma", "bank_name": "CIH Bank"},
    {"id": "SAHAMSAFI01", "latitude": 32.30, "longitude": -9.24, "monthly_volume": 900, "city": "Safi", "region": "Marrakech-Safi", "bank_name": "Saham Bank"},
    {"id": "BMCEJADIDA02", "latitude": 33.25, "longitude": -8.50, "monthly_volume": 750, "city": "El Jadida", "region": "Casablanca-Settat", "bank_name": "BMCE Bank"},
    {"id": "SGNADOR01", "latitude": 35.17, "longitude": -2.93, "monthly_volume": 880, "city": "Nador", "region": "Oriental", "bank_name": "Société Générale Maroc"},
    {"id": "SAHAMKHOURIBGA01", "latitude": 32.89, "longitude": -6.91, "monthly_volume": 920, "city": "Khouribga", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
]

# Données pour simuler l'ajout de nouveaux ATMs
potential_new_atms = [
    {"id": "SAHAMCASA_NEW", "latitude": 33.59, "longitude": -7.61, "monthly_volume": 1800, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Saham Bank"},
    {"id": "SGCASA_NEW", "latitude": 33.58, "longitude": -7.62, "monthly_volume": 1200, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "Société Générale Maroc"},
    {"id": "SAHAMRABAT_NEW", "latitude": 34.025, "longitude": -6.835, "monthly_volume": 1750, "city": "Rabat", "region": "Rabat-Salé-Kénitra", "bank_name": "Saham Bank"},
    {"id": "SAHAMMARRA_NEW", "latitude": 31.64, "longitude": -8.02, "monthly_volume": 1600, "city": "Marrakech", "region": "Marrakech-Safi", "bank_name": "Saham Bank"},
    {"id": "SGMARRA_NEW", "latitude": 31.625, "longitude": -7.99, "monthly_volume": 1150, "city": "Marrakech", "region": "Marrakech-Safi", "bank_name": "Société Générale Maroc"},
    {"id": "BMCI_NEW", "latitude": 33.55, "longitude": -7.55, "monthly_volume": 900, "city": "Casablanca", "region": "Casablanca-Settat", "bank_name": "BMCI"},
]

# Assurer que tous les ATMs ont un statut initial
for atm in existing_atms:
    if 'status' not in atm:
        atm['status'] = 'active'


# Initialisation des ATMs existants
for atm in existing_atms:
    canibalization_analyzer.add_existing_atm(atm)

@app.on_event("startup")
async def startup_event():
    """Initialisation au démarrage"""
    print("🚀 Démarrage de l'API Saham Bank Geomarketing")
    
    # Entraînement des modèles
    print("🤖 Entraînement des modèles ML...")
    predictor.train()

    # Lancement de la tâche de fond pour la mise à jour des données
    asyncio.create_task(periodic_update_task())

    print("✅ API prête!")

async def fetch_and_update_atms_from_internet():
    """Simule la récupération et la mise à jour des données ATM depuis une source externe."""
    global existing_atms, canibalization_analyzer
    print(f"🔄 Simulation de la mise à jour des données ATM... ({datetime.now().isoformat()})")

    # 1. Simuler des changements de statut
    for atm in existing_atms:
        if random.random() < 0.05: # 5% de chance de changer de statut
            atm['status'] = random.choice(['maintenance', 'inactive', 'active'])
            print(f"   - Statut de {atm['id']} changé en: {atm['status']}")

    # 2. Simuler l'ajout d'un nouvel ATM (avec une probabilité)
    if random.random() < 0.2: # 20% de chance d'ajouter un nouvel ATM
        new_atm = random.choice(potential_new_atms)
        if not any(a['id'] == new_atm['id'] for a in existing_atms):
            new_atm['status'] = 'active'
            existing_atms.append(new_atm)
            print(f"   + Nouvel ATM ajouté: {new_atm['id']} ({new_atm['bank_name']})")

    # 3. Ré-initialiser l'analyseur de cannibalisation avec les données à jour
    canibalization_analyzer = CanibalizationAnalyzer()
    for atm in existing_atms:
        canibalization_analyzer.add_existing_atm(atm)

async def periodic_update_task():
    """Tâche de fond qui exécute la mise à jour périodiquement."""
    while True:
        await asyncio.sleep(1800) # 30 minutes
        await fetch_and_update_atms_from_internet()

@app.get("/")
async def root():
    """Point d'entrée de l'API"""
    return {
        "message": "Saham Bank Geomarketing AI API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "predict": "/predict",
            "existing_atms": "/atms",
            "health": "/health",
            "dashboard": "/analytics/dashboard"
        }
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_location(location: LocationData):
    """Prédit le potentiel d'un emplacement ATM"""
    try:
        # Conversion en dictionnaire
        location_dict = location.dict()
        
        # Prédiction ML
        prediction = predictor.predict_location(location_dict)
        
        # Analyse de cannibalisation
        canibalization = canibalization_analyzer.calculate_canibalization(location_dict)
        
        # Ajustement du score en fonction de la cannibalisation
        adjusted_score = prediction['global_score'] * (1 - canibalization['canibalization_risk'] / 200)
        
        response = PredictionResponse(
            predicted_volume=prediction['predicted_volume'],
            roi_probability=prediction['roi_probability'],
            roi_prediction=prediction['roi_prediction'],
            global_score=max(0, adjusted_score),
            reason_codes=prediction['reason_codes'],
            recommendation=prediction['recommendation'],
            canibalization_analysis=canibalization
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction: {str(e)}")

@app.get("/atms")
async def get_existing_atms():
    """Retourne la liste des ATMs existants"""
    return {
        "atms": existing_atms,
        "total_count": len(existing_atms)
    }

@app.post("/atms")
async def add_atm(atm: ATMData):
    """Ajoute un nouvel ATM à la base"""
    atm_dict = atm.dict()
    existing_atms.append(atm_dict)
    canibalization_analyzer.add_existing_atm(atm_dict)
    
    return {
        "message": "ATM ajouté avec succès",
        "atm": atm_dict
    }

@app.get("/analytics/dashboard")
async def get_dashboard_data():
    """Données pour le tableau de bord avec analyse régionale"""
    
    # Calcul des métriques globales
    total_atms = len(existing_atms)
    total_volume = sum(atm.get('monthly_volume', 0) for atm in existing_atms)
    avg_volume = total_volume / total_atms if total_atms > 0 else 0
    
    # Analyse par région
    regions = {}
    for atm in existing_atms:
        region = atm.get('region', 'Unknown')
        if region not in regions:
            regions[region] = {'count': 0, 'volume': 0, 'cities': set()}
        regions[region]['count'] += 1
        regions[region]['volume'] += atm.get('monthly_volume', 0)
        regions[region]['cities'].add(atm.get('city', 'Unknown'))
    
    # Conversion des sets en listes pour JSON
    for region in regions:
        regions[region]['cities'] = list(regions[region]['cities'])
        regions[region]['avg_volume'] = regions[region]['volume'] / regions[region]['count']
    
    # Simulation de données de performance étendues
    performance_data = [
        {"month": "Jan", "volume": 45000, "roi": 12.5, "new_atms": 2},
        {"month": "Fév", "volume": 48000, "roi": 13.2, "new_atms": 1},
        {"month": "Mar", "volume": 52000, "roi": 14.1, "new_atms": 3},
        {"month": "Avr", "volume": 49000, "roi": 13.8, "new_atms": 2},
        {"month": "Mai", "volume": 55000, "roi": 15.2, "new_atms": 4},
        {"month": "Jun", "volume": 58000, "roi": 16.1, "new_atms": 2},
    ]
    
    # Zones d'opportunité étendues
    opportunity_zones = [
        {
            "zone": "Casablanca - Maarif Extension",
            "score": 85,
            "potential_volume": 1800,
            "competition_level": "Faible",
            "priority": "Haute",
            "region": "Casablanca-Settat"
        },
        {
            "zone": "Rabat - Hay Riad",
            "score": 78,
            "potential_volume": 1500,
            "competition_level": "Moyenne",
            "priority": "Haute",
            "region": "Rabat-Salé-Kénitra"
        },
        {
            "zone": "Marrakech - Hivernage",
            "score": 82,
            "potential_volume": 1600,
            "competition_level": "Faible",
            "priority": "Haute",
            "region": "Marrakech-Safi"
        },
        {
            "zone": "Tanger - Zone Franche",
            "score": 76,
            "potential_volume": 1300,
            "competition_level": "Moyenne",
            "priority": "Moyenne",
            "region": "Tanger-Tétouan-Al Hoceïma"
        },
        {
            "zone": "Agadir - Zone Touristique",
            "score": 74,
            "potential_volume": 1200,
            "competition_level": "Élevée",
            "priority": "Moyenne",
            "region": "Souss-Massa"
        },
        {
            "zone": "Fès - Campus Universitaire",
            "score": 71,
            "potential_volume": 1000,
            "competition_level": "Moyenne",
            "priority": "Faible",
            "region": "Fès-Meknès"
        }
    ]
    
    return {
        "summary": {
            "total_atms": total_atms,
            "total_monthly_volume": total_volume,
            "average_volume_per_atm": round(avg_volume, 0),
            "network_roi": 14.2,
            "coverage_rate": 78.5,
            "cities_covered": len(set(atm.get('city', 'Unknown') for atm in existing_atms)),
            "regions_covered": len(regions)
        },
        "regional_analysis": regions,
        "performance_trend": performance_data,
        "opportunity_zones": opportunity_zones,
        "last_updated": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": predictor.is_trained,
        "atms_count": len(existing_atms)
    }

if __name__ == "__main__":
    print("🏦 Lancement du serveur API Saham Bank Geomarketing")
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
