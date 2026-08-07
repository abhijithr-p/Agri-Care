from datetime import datetime
from bson import ObjectId
from db.mongo import get_database

async def create_farmer_profile(farm_data: dict) -> dict:
    """Inserts a new farmer profile record into the MongoDB database."""
    db = get_database()
    record = farm_data.copy()
    record["created_at"] = datetime.utcnow()
    
    result = await db["farms"].insert_one(record)
    record["id"] = str(result.inserted_id)
    if "_id" in record:
        del record["_id"]
    return record

async def get_farmer_profile(farm_id: str) -> dict:
    """Retrieves a farmer profile by ID."""
    db = get_database()
    record = await db["farms"].find_one({"_id": ObjectId(farm_id)})
    if record:
        record["id"] = str(record["_id"])
        del record["_id"]
    return record