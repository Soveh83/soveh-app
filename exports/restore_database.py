"""
Database Restore Script for SOVEH
Run this to restore the database from JSON exports

Usage:
    python restore_database.py --mongo-url "mongodb://localhost:27017" --db-name "soveh_production"
"""

import asyncio
import json
import argparse
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path

async def restore_db(mongo_url: str, db_name: str, backup_dir: str):
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    backup_path = Path(backup_dir)
    
    for json_file in backup_path.glob("*.json"):
        collection_name = json_file.stem
        
        with open(json_file, 'r') as f:
            docs = json.load(f)
        
        if docs:  # Only restore if there are documents
            # Clear existing data
            await db[collection_name].delete_many({})
            # Insert new data
            for doc in docs:
                if '_id' in doc:
                    del doc['_id']  # Let MongoDB generate new _id
            if docs:
                await db[collection_name].insert_many(docs)
            print(f'Restored {collection_name}: {len(docs)} documents')
        else:
            print(f'Skipped {collection_name}: empty')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Restore SOVEH database')
    parser.add_argument('--mongo-url', default='mongodb://localhost:27017', help='MongoDB URL')
    parser.add_argument('--db-name', default='soveh_production', help='Database name')
    parser.add_argument('--backup-dir', default='./database', help='Backup directory')
    
    args = parser.parse_args()
    asyncio.run(restore_db(args.mongo_url, args.db_name, args.backup_dir))
