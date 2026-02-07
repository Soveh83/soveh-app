import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'soveh_db')
client = AsyncIOMotorClient(mongo_url)
db = client.get_database(db_name)

async def add_more_products():
    products = [
        # Groceries
        {"id": "prod_6", "name": "Aashirvaad Atta 5kg", "category_id": "cat_1", "mrp": 280.0, "retailer_price": 245.0, "customer_price": 270.0, "margin_percent": 12.5, "stock_quantity": 75, "is_active": True},
        {"id": "prod_7", "name": "India Gate Basmati Rice 5kg", "category_id": "cat_1", "mrp": 650.0, "retailer_price": 580.0, "customer_price": 620.0, "margin_percent": 10.7, "stock_quantity": 40, "is_active": True},
        {"id": "prod_8", "name": "Toor Dal 1kg", "category_id": "cat_1", "mrp": 180.0, "retailer_price": 155.0, "customer_price": 170.0, "margin_percent": 13.8, "stock_quantity": 90, "is_active": True},
        {"id": "prod_9", "name": "Sugar 5kg Pack", "category_id": "cat_1", "mrp": 250.0, "retailer_price": 220.0, "customer_price": 240.0, "margin_percent": 12.0, "stock_quantity": 65, "is_active": True},
        
        # Beverages
        {"id": "prod_10", "name": "Pepsi 2L", "category_id": "cat_2", "mrp": 85.0, "retailer_price": 70.0, "customer_price": 80.0, "margin_percent": 17.6, "stock_quantity": 100, "is_active": True},
        {"id": "prod_11", "name": "Frooti Mango 1L Pack", "category_id": "cat_2", "mrp": 60.0, "retailer_price": 50.0, "customer_price": 55.0, "margin_percent": 16.6, "stock_quantity": 120, "is_active": True},
        {"id": "prod_12", "name": "Tata Tea Gold 500g", "category_id": "cat_2", "mrp": 310.0, "retailer_price": 270.0, "customer_price": 295.0, "margin_percent": 12.9, "stock_quantity": 55, "is_active": True},
        {"id": "prod_13", "name": "Nescafe Classic 200g", "category_id": "cat_2", "mrp": 450.0, "retailer_price": 395.0, "customer_price": 430.0, "margin_percent": 12.2, "stock_quantity": 35, "is_active": True},
        
        # Snacks
        {"id": "prod_14", "name": "Kurkure Masala Munch 100g", "category_id": "cat_3", "mrp": 30.0, "retailer_price": 26.0, "customer_price": 28.0, "margin_percent": 13.3, "stock_quantity": 250, "is_active": True},
        {"id": "prod_15", "name": "Parle-G Biscuits 800g", "category_id": "cat_3", "mrp": 80.0, "retailer_price": 68.0, "customer_price": 75.0, "margin_percent": 15.0, "stock_quantity": 180, "is_active": True},
        {"id": "prod_16", "name": "Haldirams Bhujia 400g", "category_id": "cat_3", "mrp": 145.0, "retailer_price": 125.0, "customer_price": 138.0, "margin_percent": 13.8, "stock_quantity": 85, "is_active": True},
        {"id": "prod_17", "name": "Britannia Good Day 250g", "category_id": "cat_3", "mrp": 55.0, "retailer_price": 47.0, "customer_price": 52.0, "margin_percent": 14.5, "stock_quantity": 150, "is_active": True},
        
        # Personal Care
        {"id": "prod_18", "name": "Dove Soap 100g (Pack of 4)", "category_id": "cat_4", "mrp": 195.0, "retailer_price": 165.0, "customer_price": 185.0, "margin_percent": 15.3, "stock_quantity": 70, "is_active": True},
        {"id": "prod_19", "name": "Head & Shoulders Shampoo 340ml", "category_id": "cat_4", "mrp": 340.0, "retailer_price": 295.0, "customer_price": 325.0, "margin_percent": 13.2, "stock_quantity": 45, "is_active": True},
        {"id": "prod_20", "name": "Nivea Body Lotion 400ml", "category_id": "cat_4", "mrp": 450.0, "retailer_price": 390.0, "customer_price": 430.0, "margin_percent": 13.3, "stock_quantity": 30, "is_active": True},
        {"id": "prod_21", "name": "Dettol Handwash 900ml Refill", "category_id": "cat_4", "mrp": 180.0, "retailer_price": 155.0, "customer_price": 172.0, "margin_percent": 13.8, "stock_quantity": 95, "is_active": True},
    ]
    
    for product in products:
        await db.products.update_one(
            {"id": product["id"]},
            {"$set": product},
            upsert=True
        )
    
    count = await db.products.count_documents({})
    print(f"✅ Total products in database: {count}")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_more_products())
