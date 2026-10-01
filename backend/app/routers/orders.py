import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/orders", tags=["Orders"])
staff_or_admin = RoleChecker(["Admin", "Restaurant Staff", "Kitchen Staff"])

@router.get("/my", response_model=List[schemas.OrderResponse])
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.created_at.desc()).all()

@router.get("/", response_model=List[schemas.OrderResponse])
def get_all_orders(status: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(staff_or_admin)):
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status)
    return query.order_by(models.Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order_by_id(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check permissions
    if current_user.role.name == "Customer" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    return order

@router.post("/", response_model=schemas.OrderResponse)
def place_order(
    order_in: schemas.OrderCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Cart is empty. Add items to place an order.")

    subtotal = 0.0
    order_items_to_create = []

    # 1. Validate items and calculate subtotal
    for item_data in order_in.items:
        food_item = db.query(models.FoodItem).filter(models.FoodItem.id == item_data.food_item_id).first()
        if not food_item:
            raise HTTPException(status_code=404, detail=f"Food item #{item_data.food_item_id} not found")
        if not food_item.is_available:
            raise HTTPException(status_code=400, detail=f"'{food_item.name}' is currently unavailable")

        unit_price = float(food_item.price)
        item_subtotal = unit_price * item_data.quantity
        subtotal += item_subtotal

        order_items_to_create.append({
            "food_item_id": food_item.id,
            "quantity": item_data.quantity,
            "unit_price": unit_price,
            "subtotal": item_subtotal,
            "special_instructions": item_data.special_instructions,
            "food_obj": food_item
        })

    # 2. Check Coupon Discount
    discount_amount = 0.0
    if order_in.coupon_code:
        coupon = db.query(models.Offer).filter(
            models.Offer.code == order_in.coupon_code,
            models.Offer.is_active == True
        ).first()
        if coupon:
            if subtotal >= float(coupon.min_order_amount):
                if float(coupon.discount_percent) > 0:
                    discount_amount = subtotal * (float(coupon.discount_percent) / 100.0)
                elif float(coupon.fixed_discount) > 0:
                    discount_amount = float(coupon.fixed_discount)

    tax_amount = (subtotal - discount_amount) * 0.08 # 8% Tax rate
    total_amount = (subtotal - discount_amount) + tax_amount

    # Generate Order Number
    order_num = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}"

    # Calculate estimated preparation time based on food items
    max_prep_time = 15
    for item_dict in order_items_to_create:
        food_prep = getattr(item_dict["food_obj"], "prep_time_minutes", 15) or 15
        if food_prep > max_prep_time:
            max_prep_time = food_prep
    
    # Add minor buffer if ordering many items
    total_qty = sum(item_dict["quantity"] for item_dict in order_items_to_create)
    if total_qty > 3:
        max_prep_time += 5
        
    estimated_mins = int(max_prep_time)
    from datetime import timedelta
    expected_ready = datetime.now() + timedelta(minutes=estimated_mins)

    # 3. Create Order object
    new_order = models.Order(
        order_number=order_num,
        user_id=current_user.id,
        table_id=order_in.table_id if order_in.order_type == "Dine-In" else None,
        order_type=order_in.order_type,
        status="Order Received",
        subtotal=subtotal,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        payment_status="Paid", # Simulated online payment
        payment_method=order_in.payment_method,
        estimated_minutes=estimated_mins,
        expected_ready_time=expected_ready,
        notes=order_in.notes
    )

    if order_in.order_type == "Dine-In" and order_in.table_id:
        table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == order_in.table_id).first()
        if table:
            table.status = "Occupied"

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # 4. Create Order Items & Auto-update Inventory Quantities
    for item_dict in order_items_to_create:
        order_item = models.OrderItem(
            order_id=new_order.id,
            food_item_id=item_dict["food_item_id"],
            quantity=item_dict["quantity"],
            unit_price=item_dict["unit_price"],
            subtotal=item_dict["subtotal"],
            special_instructions=item_dict["special_instructions"]
        )
        db.add(order_item)

        # Smart Inventory Feature: Auto-deduct raw ingredients based on recipe mapping
        food_obj = item_dict["food_obj"]
        for recipe in food_obj.food_ingredients:
            ingredient = recipe.ingredient
            deduct_qty = float(recipe.quantity_required) * item_dict["quantity"]
            ingredient.current_stock = max(0.0, float(ingredient.current_stock) - deduct_qty)
            
            # Log inventory transaction
            inv_tx = models.InventoryTransaction(
                ingredient_id=ingredient.id,
                transaction_type="OUT",
                quantity=deduct_qty,
                notes=f"Auto-deducted for Order #{order_num}"
            )
            db.add(inv_tx)

    # Add notification for customer
    notif = models.Notification(
        user_id=current_user.id,
        title="Order Received!",
        message=f"Your order #{order_num} has been placed successfully and sent to the kitchen."
    )
    db.add(notif)

    db.commit()
    db.refresh(new_order)
    return new_order

@router.patch("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int, 
    status: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(staff_or_admin)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    
    # Send notification update to customer
    notif = models.Notification(
        user_id=order.user_id,
        title=f"Order Update: {status}",
        message=f"Your order #{order.order_number} status is now '{status}'."
    )
    db.add(notif)

    db.commit()
    db.refresh(order)
    return order
