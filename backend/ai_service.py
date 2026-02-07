# AI Service for SREYANIMTI App
import os
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import base64
import uuid

logger = logging.getLogger(__name__)

EMERGENT_LLM_KEY = os.getenv('EMERGENT_LLM_KEY', '')

class AIService:
    def __init__(self):
        self.api_key = EMERGENT_LLM_KEY
        
    async def get_product_recommendations(self, user_id: str, purchase_history: list, current_cart: list = None) -> list:
        """AI-powered product recommendations based on user behavior"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"recommendations-{user_id}-{uuid.uuid4().hex[:8]}",
                system_message="""You are an AI product recommendation engine for a B2B retail supply app.
                Analyze purchase history and suggest relevant products.
                Return ONLY a JSON array of product recommendations with fields: product_name, reason, priority (1-5).
                Be concise and practical for Indian retail shops."""
            ).with_model("openai", "gpt-4o-mini")
            
            history_text = ", ".join([p.get('name', '') for p in purchase_history[-10:]]) if purchase_history else "No history"
            cart_text = ", ".join([p.get('product_name', '') for p in current_cart]) if current_cart else "Empty cart"
            
            response = await chat.send_message(UserMessage(
                text=f"""Based on this retailer's data, suggest 5 products they might need:
                
Purchase History: {history_text}
Current Cart: {cart_text}

Return JSON array only."""
            ))
            
            return response
        except Exception as e:
            logger.error(f"AI recommendation error: {str(e)}")
            return []
    
    async def smart_search(self, query: str, products: list) -> dict:
        """AI-powered natural language search"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"search-{uuid.uuid4().hex[:8]}",
                system_message="""You are a smart search assistant for a grocery B2B app.
                Understand user intent and match products. Handle Hindi/English mixed queries.
                Return JSON with: matched_products (list of product IDs), intent (what user wants), suggestions (related searches)."""
            ).with_model("openai", "gpt-4o-mini")
            
            product_list = ", ".join([f"{p['id']}: {p['name']}" for p in products[:50]])
            
            response = await chat.send_message(UserMessage(
                text=f"""User searched: "{query}"
                
Available products: {product_list}

Match products and understand intent. Return JSON only."""
            ))
            
            return {"query": query, "ai_response": response}
        except Exception as e:
            logger.error(f"AI search error: {str(e)}")
            return {"query": query, "ai_response": None}
    
    async def verify_kyc_document(self, image_base64: str, document_type: str) -> dict:
        """AI-powered KYC document verification"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"kyc-{uuid.uuid4().hex[:8]}",
                system_message="""You are a KYC document verification AI for an Indian B2B retail app.
                Analyze documents for authenticity and extract information.
                Be strict but fair. Check for:
                - Document clarity and legibility
                - Presence of required information
                - Signs of tampering or editing
                - Consistency of details
                
                Return JSON with: 
                - verified (boolean)
                - confidence (0-100)
                - extracted_info (dict with relevant fields)
                - issues (list of any concerns)
                - recommendation (approve/reject/manual_review)"""
            ).with_model("openai", "gpt-4o")
            
            image_content = ImageContent(image_base64=image_base64)
            
            response = await chat.send_message(UserMessage(
                text=f"""Verify this {document_type} document for KYC.
                
Document Type: {document_type}
Requirements:
- For Trade License: Check validity, business name, address, license number
- For Shop Photo: Verify it's a real shop, readable signboard, proper storefront
- For ID Proof: Check name, photo clarity, document number

Analyze and return verification result as JSON.""",
                file_contents=[image_content]
            ))
            
            return {"document_type": document_type, "verification": response}
        except Exception as e:
            logger.error(f"KYC verification error: {str(e)}")
            return {"document_type": document_type, "verification": None, "error": str(e)}
    
    async def chatbot_response(self, user_message: str, user_context: dict) -> str:
        """AI chatbot for customer support"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"chat-{user_context.get('user_id', 'anon')}-{uuid.uuid4().hex[:8]}",
                system_message="""You are SREYANIMTI's helpful AI assistant for a B2B retail supply app.
                You help retailers and customers with:
                - Order tracking and issues
                - Product information
                - Payment and credit queries
                - Returns and refunds
                - Account and KYC help
                
                Be friendly, concise, and helpful. Use simple language.
                Support Hindi and English. If you can't help, offer to connect with human support."""
            ).with_model("openai", "gpt-4o-mini")
            
            context_text = f"""
User Role: {user_context.get('role', 'unknown')}
User Name: {user_context.get('name', 'User')}
Recent Orders: {user_context.get('recent_orders', 0)}
"""
            
            response = await chat.send_message(UserMessage(
                text=f"""Context: {context_text}

User says: {user_message}

Respond helpfully."""
            ))
            
            return response
        except Exception as e:
            logger.error(f"Chatbot error: {str(e)}")
            return "I'm having trouble right now. Please try again or contact support at +91-9999999999."
    
    async def analyze_shop_image(self, image_base64: str) -> dict:
        """AI analysis of shop photos for KYC"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"shop-analysis-{uuid.uuid4().hex[:8]}",
                system_message="""Analyze shop/store photos for KYC verification.
                Extract: shop name from signboard, store type (kirana, bakery, etc.), 
                approximate size, location indicators, legitimacy assessment.
                Return JSON with all findings."""
            ).with_model("openai", "gpt-4o")
            
            image_content = ImageContent(image_base64=image_base64)
            
            response = await chat.send_message(UserMessage(
                text="Analyze this shop photo and extract all relevant business information. Return JSON.",
                file_contents=[image_content]
            ))
            
            return {"analysis": response}
        except Exception as e:
            logger.error(f"Shop analysis error: {str(e)}")
            return {"analysis": None, "error": str(e)}

# Global AI service instance
ai_service = AIService()
