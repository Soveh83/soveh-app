# Admin authentication utilities
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

# Admin role constants
ADMIN_ROLES = ["admin", "super_admin"]

async def is_admin(user_id: str, db: AsyncIOMotorDatabase) -> bool:
    """Check if user has admin privileges"""
    try:
        user = await db.users.find_one({"id": user_id})
        if not user:
            return False
        return user.get("role") in ADMIN_ROLES
    except Exception as e:
        logger.error(f"Error checking admin status: {str(e)}")
        return False

async def verify_admin(user_id: str, db: AsyncIOMotorDatabase):
    """Verify admin status and raise exception if not admin"""
    if not await is_admin(user_id, db):
        raise HTTPException(
            status_code=403,
            detail="Unauthorized. Admin privileges required."
        )

async def get_user_by_uid(uid: str, db: AsyncIOMotorDatabase):
    """Get user by UID (similar to Firebase Auth UID)"""
    user = await db.users.find_one({"id": uid})
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    return user
