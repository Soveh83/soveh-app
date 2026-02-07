import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'soveh_db')
client = AsyncIOMotorClient(mongo_url)
db = client.get_database(db_name)

# Product images from Unsplash
PRODUCT_IMAGES = {
    # Groceries
    "prod_1": "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400",  # Salt
    "prod_2": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",  # Oil
    "prod_6": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400",  # Atta
    "prod_7": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",  # Rice
    "prod_8": "https://images.unsplash.com/photo-1613758947307-f3b8f5d80711?w=400",  # Dal
    "prod_9": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400",  # Sugar
    
    # Beverages
    "prod_3": "https://images.unsplash.com/photo-1651307426653-2b63a236ece5?w=400",  # Cola
    "prod_10": "https://images.unsplash.com/photo-1689910138858-5282476bf656?w=400",  # Pepsi
    "prod_11": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400",  # Mango
    "prod_12": "https://images.unsplash.com/photo-1769893854321-7b0951695080?w=400",  # Tea
    "prod_13": "https://images.unsplash.com/photo-1579721333096-145ed9596b0f?w=400",  # Coffee
    
    # Snacks
    "prod_4": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",  # Chips
    "prod_14": "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",  # Kurkure
    "prod_15": "https://images.unsplash.com/photo-1636986196800-501029e4758d?w=400",  # Biscuits
    "prod_16": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",  # Namkeen
    "prod_17": "https://images.unsplash.com/photo-1560242565-48cea3141b4f?w=400",  # Cookies
    
    # Personal Care
    "prod_5": "https://images.unsplash.com/photo-1585232350145-9e7e7e0c9faf?w=400",  # Toothpaste
    "prod_18": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400",  # Soap
    "prod_19": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400",  # Shampoo
    "prod_20": "https://images.unsplash.com/photo-1750271336429-8b0a507785c0?w=400",  # Lotion
    "prod_21": "https://images.unsplash.com/photo-1584949091598-c31daaaa4aa9?w=400",  # Handwash
}

# Category images
CATEGORY_IMAGES = {
    "cat_1": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",  # Groceries
    "cat_2": "https://images.unsplash.com/photo-1651307426653-2b63a236ece5?w=400",  # Beverages
    "cat_3": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",  # Snacks
    "cat_4": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",  # Personal Care
}

async def update_images():
    # Update products with images
    for prod_id, image_url in PRODUCT_IMAGES.items():
        await db.products.update_one(
            {"id": prod_id},
            {"$set": {"images": [image_url]}}
        )
    
    # Update categories with images
    for cat_id, image_url in CATEGORY_IMAGES.items():
        await db.categories.update_one(
            {"id": cat_id},
            {"$set": {"image": image_url}}
        )
    
    print("✅ Updated all product and category images!")
    
    # Count products
    count = await db.products.count_documents({})
    print(f"Total products: {count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_images())
