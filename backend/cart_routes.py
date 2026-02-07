# Cart Management System
from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/cart", tags=["cart"])

class CartItemAdd(BaseModel):
    product_id: str
    variant_id: str
    quantity: int = 1

class CartUpdate(BaseModel):
    items: List[CartItemAdd]

@router.get("")
async def get_cart(current_user: dict, db: AsyncIOMotorDatabase):
    """Get current user's cart"""
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    
    if not cart:
        # Create empty cart
        cart = {
            "user_id": current_user["id"],
            "items": [],
            "subtotal": 0.0,
            "updated_at": datetime.utcnow()
        }
        await db.carts.insert_one(cart)
    
    # Enrich cart with product details
    enriched_items = []
    subtotal = 0.0
    
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]})
        if product:
            variant = next(
                (v for v in product.get("variants", []) if v["variant_id"] == item["variant_id"]),
                None
            )
            if variant:
                item_total = variant["retailer_price"] * item["quantity"]
                enriched_items.append({
                    **item,
                    "product_name": product["name"],
                    "brand": product.get("brand"),
                    "image": product.get("images", [])[0] if product.get("images") else None,
                    "variant_name": variant["name"],
                    "pack_size": variant["pack_size"],
                    "mrp": variant["mrp"],
                    "price": variant["retailer_price"],
                    "total": item_total,
                    "stock_available": variant["stock_quantity"]
                })
                subtotal += item_total
    
    return {
        "success": True,
        "cart": {
            "items": enriched_items,
            "subtotal": subtotal,
            "item_count": len(enriched_items)
        }
    }

@router.post("/add")
async def add_to_cart(item: CartItemAdd, current_user: dict, db: AsyncIOMotorDatabase):
    """Add item to cart"""
    # Verify product and variant exist
    product = await db.products.find_one({"id": item.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    variant = next(
        (v for v in product.get("variants", []) if v["variant_id"] == item.variant_id),
        None
    )
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    
    # Check stock
    if variant["stock_quantity"] < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    if not cart:
        cart = {
            "user_id": current_user["id"],
            "items": [],
            "updated_at": datetime.utcnow()
        }
        await db.carts.insert_one(cart)
    
    # Check if item already in cart
    existing_item = next(
        (i for i in cart["items"] if i["product_id"] == item.product_id and i["variant_id"] == item.variant_id),
        None
    )
    
    if existing_item:
        # Update quantity
        existing_item["quantity"] += item.quantity
        await db.carts.update_one(
            {"user_id": current_user["id"]},
            {"$set": {"items": cart["items"], "updated_at": datetime.utcnow()}}
        )
    else:
        # Add new item
        new_item = {
            "product_id": item.product_id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "added_at": datetime.utcnow()
        }
        await db.carts.update_one(
            {"user_id": current_user["id"]},
            {"$push": {"items": new_item}, "$set": {"updated_at": datetime.utcnow()}}
        )
    
    return {"success": True, "message": "Item added to cart"}

@router.delete("/remove/{product_id}/{variant_id}")
async def remove_from_cart(product_id: str, variant_id: str, current_user: dict, db: AsyncIOMotorDatabase):
    """Remove item from cart"""
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {
            "$pull": {"items": {"product_id": product_id, "variant_id": variant_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    return {"success": True, "message": "Item removed from cart"}

@router.delete("/clear")
async def clear_cart(current_user: dict, db: AsyncIOMotorDatabase):
    """Clear entire cart"""
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    return {"success": True, "message": "Cart cleared"}

@router.patch("/update-quantity")
async def update_cart_quantity(
    product_id: str,
    variant_id: str,
    quantity: int,
    current_user: dict,
    db: AsyncIOMotorDatabase
):
    """Update item quantity in cart"""
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    
    # Check stock
    product = await db.products.find_one({"id": product_id})
    if product:
        variant = next(
            (v for v in product.get("variants", []) if v["variant_id"] == variant_id),
            None
        )
        if variant and variant["stock_quantity"] < quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Update quantity
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    if cart:
        for item in cart["items"]:
            if item["product_id"] == product_id and item["variant_id"] == variant_id:
                item["quantity"] = quantity
        
        await db.carts.update_one(
            {"user_id": current_user["id"]},
            {"$set": {"items": cart["items"], "updated_at": datetime.utcnow()}}
        )
    
    return {"success": True, "message": "Quantity updated"}
