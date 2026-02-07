import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client.get_database(os.environ.get('DB_NAME', 'soveh_db'))

async def seed_data():
    # Clear existing data
    await db.categories.delete_many({})
    await db.products.delete_many({})
    
    # Add categories
    categories = [
        {"id": "cat_1", "name": "Groceries", "is_active": True},
        {"id": "cat_2", "name": "Beverages", "is_active": True},
        {"id": "cat_3", "name": "Snacks", "is_active": True},
        {"id": "cat_4", "name": "Personal Care", "is_active": True},
    ]
    
    await db.categories.insert_many(categories)
    print(f"✅ Added {len(categories)} categories")
    
    # Add products
    products = [
        {
            "id": "prod_1",
            "name": "Tata Salt 1kg",
            "category_id": "cat_1",
            "mrp": 25.0,
            "retailer_price": 20.0,
            "customer_price": 23.0,
            "margin_percent": 20.0,
            "stock_quantity": 100,
            "is_active": True
        },
        {
            "id": "prod_2",
            "name": "Fortune Refined Oil 1L",
            "category_id": "cat_1",
            "mrp": 150.0,
            "retailer_price": 130.0,
            "customer_price": 145.0,
            "margin_percent": 13.3,
            "stock_quantity": 50,
            "is_active": True
        },
        {
            "id": "prod_3",
            "name": "Coca Cola 2L",
            "category_id": "cat_2",
            "mrp": 90.0,
            "retailer_price": 75.0,
            "customer_price": 85.0,
            "margin_percent": 16.7,
            "stock_quantity": 80,
            "is_active": True
        },
        {
            "id": "prod_4",
            "name": "Lays Chips 100g",
            "category_id": "cat_3",
            "mrp": 40.0,
            "retailer_price": 35.0,
            "customer_price": 38.0,
            "margin_percent": 12.5,
            "stock_quantity": 200,
            "is_active": True
        },
        {
            "id": "prod_5",
            "name": "Colgate Toothpaste 200g",
            "category_id": "cat_4",
            "mrp": 120.0,
            "retailer_price": 100.0,
            "customer_price": 115.0,
            "margin_percent": 16.7,
            "stock_quantity": 60,
            "is_active": True
        },
    ]
    
    await db.products.insert_many(products)
    print(f"✅ Added {len(products)} products")
    
    print("\n🎉 Seed data added successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
