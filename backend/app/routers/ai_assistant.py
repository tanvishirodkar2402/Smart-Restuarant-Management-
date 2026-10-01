from typing import List, Optional
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user_optional

router = APIRouter(prefix="/ai", tags=["Smart AI Features"])

@router.post("/chat", response_model=schemas.AIChatResponse)
def ai_chat_assistant(
    req: schemas.AIChatRequest, 
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    msg_lower = req.message.lower()
    
    # Fetch menu items for recommendation context
    all_items = db.query(models.FoodItem).filter(models.FoodItem.is_available == True).all()

    recommended_items = []
    reply = ""
    parsed_intent = "general_assistance"
    order_data = None

    # Order tracking & serving estimation intents
    order_query_keywords = [
        "where is my order", "order status", "when will it be served", "when is my order", 
        "when will my order", "where is my food", "my order", "order ready", "is my food ready", 
        "track order", "track my order", "status of my order", "when will order", "order serve", 
        "serving time", "how long for my order", "refresssedrun", "refresh order", "where order"
    ]

    is_order_query = any(k in msg_lower for k in order_query_keywords) or ("order" in msg_lower and any(w in msg_lower for w in ["where", "when", "status", "ready", "serve", "track", "my", "is"]))

    if is_order_query:
        parsed_intent = "order_tracking"
        target_order = None

        # Check if a specific order number like ORD-20261001-001 or ID is mentioned in the prompt
        ord_match = re.search(r'ord-[a-z0-9-]+', msg_lower)
        if ord_match:
            ord_num = ord_match.group(0).upper()
            target_order = db.query(models.Order).filter(models.Order.order_number.ilike(f"%{ord_num}%")).first()

        # Else try fetching the user's latest order if logged in
        if not target_order and current_user:
            target_order = db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.id.desc()).first()

        # Else fallback to the most recent overall order in the system
        if not target_order:
            target_order = db.query(models.Order).order_by(models.Order.id.desc()).first()

        if target_order:
            db.refresh(target_order)
            order_data = schemas.OrderResponse.from_orm(target_order)

            order_num = target_order.order_number
            status = target_order.status
            total_price = float(target_order.total_amount)
            items_summary = ", ".join([f"{item.quantity}x {item.food_item.name if item.food_item else 'Dish'}" for item in target_order.items]) if target_order.items else "Food items"

            table_text = f"at Table #{target_order.table.table_number} ({target_order.table.location})" if target_order.table else "for Delivery/Takeaway"

            if status.lower() == "received":
                reply = f"📦 Order #{order_num} has been received by the kitchen! Preparation will begin shortly. Estimated serving time is 15-20 minutes {table_text}. Items: {items_summary} (Total: ₹{total_price:.2f})."
            elif status.lower() in ["accepted", "preparing"]:
                reply = f"👨‍🍳 Chef Marco is actively preparing your order #{order_num} fresh in the kitchen! It will be served to you in approximately 8-12 minutes {table_text}. Ordered items: {items_summary}."
            elif status.lower() == "ready":
                reply = f"🔔 Great news! Order #{order_num} is fresh, hot, and currently being served to your table right now! 🍽️ Items: {items_summary}."
            elif status.lower() == "completed":
                reply = f"✅ Order #{order_num} was served and completed. We hope you enjoyed your meal! ({items_summary})."
            elif status.lower() == "cancelled":
                reply = f"❌ Order #{order_num} was cancelled. Please feel free to place a new order anytime."
            else:
                reply = f"ℹ️ Order #{order_num} is currently in state '{status}'. Serving location: {table_text}. Items: {items_summary}."
        else:
            reply = "You don't have any active orders right now. Explore our menu to place your first order and track it live!"

    # Rule-based intelligent intent matching & menu reasoning
    elif any(w in msg_lower for w in ["pizza", "pizzas"]):
        recommended_items = [item for item in all_items if "pizza" in item.name.lower()]
        reply = "Here are our top wood-fired artisanal pizzas! The Spicy Pepperoni with Hot Honey is customer favorite."
    
    elif any(w in msg_lower for w in ["burger", "burgers", "sandwich"]):
        recommended_items = [item for item in all_items if "burger" in item.name.lower()]
        reply = "Our Gourmet Burgers are made with 100% fresh ingredients and served with seasoned fries!"

    elif any(w in msg_lower for w in ["veg", "vegetarian", "plant based"]):
        recommended_items = [item for item in all_items if item.is_vegetarian]
        reply = "We have wonderful vegetarian options! Try our Truffle Mushroom Bruschetta or Charcoal Paneer Tikka."

    elif any(w in msg_lower for w in ["spicy", "hot", "chili"]):
        recommended_items = [item for item in all_items if item.is_spicy]
        reply = "Looking for a kick? Here are our best spicy dishes prepared with fresh chili spices."

    elif any(w in msg_lower for w in ["drink", "beverage", "coffee", "juice", "spritzer", "cocktail"]):
        recommended_items = [item for item in all_items if item.category_id in [7, 8]]
        reply = "Quench your thirst with our hand-crafted mocktails, spritzers, fresh juices, and specialty coffees."

    elif any(w in msg_lower for w in ["dessert", "sweet", "cake", "tiramisu", "lava"]):
        recommended_items = [item for item in all_items if item.category_id == 6]
        reply = "Save room for dessert! Our Molten Lava Cake, Alphonso Mango Cheesecake, and Cardamom Saffron Rasmalai are made fresh daily."

    elif any(w in msg_lower for w in ["recommend", "best", "popular", "top"]):
        recommended_items = sorted(all_items, key=lambda x: float(x.rating_avg), reverse=True)[:3]
        reply = f"Based on customer ratings, I highly recommend {recommended_items[0].name} ({recommended_items[0].rating_avg}★) and {recommended_items[1].name}!"

    elif any(w in msg_lower for w in ["hours", "open", "time", "location"]):
        reply = "We are open daily from 11:00 AM to 11:00 PM. Our address is 100 Gourmet Boulevard, Foodville."

    elif any(w in msg_lower for w in ["table", "reserve", "book"]):
        reply = "You can easily reserve a table through our 'Table Reservation' page or scan a QR code at your table for quick ordering!"

    else:
        # Default helpful assistant reply
        recommended_items = sorted(all_items, key=lambda x: float(x.rating_avg), reverse=True)[:2]
        reply = "Welcome to Smart Restaurant AI Assistant! Ask me 'Where is my order?' to check live preparation & serving time, or ask for dish recommendations!"

    return schemas.AIChatResponse(
        reply=reply,
        recommended_items=[schemas.FoodItemResponse.from_orm(i) for i in recommended_items],
        parsed_intent=parsed_intent,
        order_data=order_data
    )

@router.post("/voice-parse")
def parse_voice_order(req: schemas.AIChatRequest, db: Session = Depends(get_db)):
    text = req.message.lower()
    all_items = db.query(models.FoodItem).filter(models.FoodItem.is_available == True).all()

    found_cart_items = []

    # Simple speech intent extractor
    for item in all_items:
        item_name_lower = item.name.lower()
        # Extract name keywords (e.g. "margherita" or "burger" or "fettuccine")
        keywords = item_name_lower.split()
        main_kw = [k for k in keywords if len(k) > 3]
        
        for kw in main_kw:
            if kw in text:
                # Attempt to extract quantity prior to keyword (e.g. "2 pizzas")
                match = re.search(rf'(\d+)\s+(?:\w+\s+)?{kw}', text)
                qty = int(match.group(1)) if match else 1
                
                found_cart_items.append({
                    "food_item_id": item.id,
                    "name": item.name,
                    "price": float(item.price),
                    "quantity": qty
                })
                break

    return {
        "voice_transcript": req.message,
        "matched_items": found_cart_items,
        "message": f"Recognized {len(found_cart_items)} item(s) from your voice command." if found_cart_items else "Could not match any specific menu item from speech. Please try saying item names like 'Margherita Pizza' or 'Beef Burger'."
    }
