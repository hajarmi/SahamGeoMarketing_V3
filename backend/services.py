"""
Service layer for the Geomarketing AI API.
Handles data persistence, model interactions, and business logic.
"""
import asyncio
import json
import logging
import random
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import aiofiles
from ml_models import ATMLocationPredictor, CanibalizationAnalyzer
from pydantic import ValidationError, parse_obj_as

from schemas import ATMData

DATA_FILE = Path(__file__).parent / "data.json"

logger = logging.getLogger(__name__)

DETAILED_ATMS = [
    {
      "id": "ATM001",
      "name": "Attijariwafa Bank - Maarif",
      "latitude": 33.5731,
      "longitude": -7.5898,
      "monthly_volume": 1200,
      "status": "active",
      "city": "Casablanca",
      "region": "Casablanca-Settat",
      "bank_name": "Attijariwafa Bank",
      "installation_type": "fixed",
      "branch_location": "Agence Maarif",
      "services": ["retrait", "depot", "consultation", "virement"],
    },
    {
      "id": "ATM002",
      "name": "Banque Populaire - Anfa",
      "latitude": 33.5891,
      "longitude": -7.6031,
      "monthly_volume": 950,
      "status": "active",
      "city": "Casablanca",
      "region": "Casablanca-Settat",
      "bank_name": "Banque Populaire",
      "installation_type": "fixed",
      "branch_location": "Agence Anfa",
      "services": ["retrait", "depot", "consultation"],
    },
    {
      "id": "ATM003",
      "name": "BMCE Bank - CFC",
      "latitude": 33.5642,
      "longitude": -7.5756,
      "monthly_volume": 1400,
      "status": "active",
      "city": "Casablanca",
      "region": "Casablanca-Settat",
      "bank_name": "BMCE Bank",
      "installation_type": "fixed",
      "branch_location": "Centre Financier",
      "services": ["retrait", "depot", "consultation", "virement", "change"],
    },
    {
      "id": "ATM004",
      "name": "Crédit du Maroc - Gauthier",
      "latitude": 33.5923,
      "longitude": -7.6156,
      "monthly_volume": 800,
      "status": "active",
      "city": "Casablanca",
      "region": "Casablanca-Settat",
      "bank_name": "Crédit du Maroc",
      "installation_type": "portable",
      "branch_location": "Centre Commercial Gauthier",
      "services": ["retrait", "consultation"],
    },
    {
      "id": "ATM005",
      "name": "CIH Bank - Ain Diab",
      "latitude": 33.5534,
      "longitude": -7.5634,
      "monthly_volume": 1100,
      "status": "active",
      "city": "Casablanca",
      "region": "Casablanca-Settat",
      "bank_name": "CIH Bank",
      "installation_type": "fixed",
      "branch_location": "Corniche Ain Diab",
      "services": ["retrait", "depot", "consultation"],
    },
    {
      "id": "ATM006",
      "name": "BMCI - Twin Center",
      "latitude": 33.5831,
      "longitude": -7.5998,
      "monthly_volume": 1350,
      "status": "active",
      "city": "Casablanca",
      "region": "Casablanca-Settat",
      "bank_name": "BMCI",
      "installation_type": "fixed",
      "branch_location": "Twin Center",
      "services": ["retrait", "depot", "consultation", "virement"],
    }
]

class ATMService:
    """Manages ATM data and related ML models."""

    def __init__(self):
        self.predictor = ATMLocationPredictor()
        self.canibalization_analyzer = CanibalizationAnalyzer()
        self.existing_atms: List[ATMData] = []
        self.lock = asyncio.Lock()

    async def _load_and_merge_atms(self) -> List[ATMData]:
        raw_atms = []
        if DATA_FILE.exists():
            try:
                async with aiofiles.open(DATA_FILE, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    if content:
                        raw_data = json.loads(content)
                        raw_atms = parse_obj_as(List[ATMData], raw_data)
            except (IOError, json.JSONDecodeError, ValidationError) as e:
                logger.error(f"Could not load or parse data from file: {e}")

        normalized_atms = []
        for atm in raw_atms:
            atm_dict = atm.dict()
            atm_id = atm_dict.get('id') or atm_dict.get('idatm')
            if not atm_id:
                continue

            detailed = next((d for d in DETAILED_ATMS if d["id"] == atm_id), None)
            if detailed:
                merged_atm = {**detailed, **atm_dict}
                merged_atm['id'] = atm_id
                normalized_atms.append(ATMData(**merged_atm))
            else:
                atm_dict['id'] = atm_id
                atm_dict['name'] = atm_id
                normalized_atms.append(ATMData(**atm_dict))

        combined_atms = {atm.id: atm for atm in normalized_atms}
        for atm_data in DETAILED_ATMS:
            if atm_data["id"] not in combined_atms:
                combined_atms[atm_data["id"]] = ATMData(**atm_data)

        return list(combined_atms.values())

    async def initialize(self):
        logger.info("Training ML models...")
        self.predictor.train()
        logger.info("Loading ATM data...")
        await self.reload_data()

    async def reload_data(self):
        self.existing_atms = await self._load_and_merge_atms()
        self.canibalization_analyzer = CanibalizationAnalyzer()
        for atm in self.existing_atms:
            self.canibalization_analyzer.add_existing_atm(atm)
        logger.info(f"{len(self.existing_atms)} ATMs loaded and analyzer updated.")

    # ... (the rest of the class remains the same)

atm_service = ATMService()
