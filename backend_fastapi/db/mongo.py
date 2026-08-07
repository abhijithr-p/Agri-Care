import os
from motor.motor_asyncio import AsyncIOMotorClient
# Get MongoDB Connection URI from environment variables or fallback to local instance
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "agricare_db")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    """Initializes the MongoDB connection pool when the application starts."""
    db_instance.client = AsyncIOMotorClient(MONGO_URL)
    db_instance.db = db_instance.client[DB_NAME]
    print(f"Connected to MongoDB database: {DB_NAME}")

async def close_mongo_connection():
    """Closes database connections gracefully when the application stops."""
    if db_instance.client:
        db_instance.client.close()
        print("Closed MongoDB connection.")

def get_database():
    """Helper function to access the database instance in service layers."""
    return db_instance.db