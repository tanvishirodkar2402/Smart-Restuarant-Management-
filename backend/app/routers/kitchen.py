from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import RoleChecker

router = APIRouter(prefix="/kitchen", tags=["Kitchen Display System"])
kitchen_or_admin = RoleChecker(["Kitchen Staff", "Admin", "Restaurant Staff"])

@router.get("/orders", response_model=List[schemas.OrderResponse])
def get_kitchen_orders(db: Session = Depends(get_db), current_user: models.User = Depends(kitchen_or_admin)):
    # Kitchen needs orders that are Received, Accepted, Preparing, or Ready (not Completed or Cancelled)
    orders = db.query(models.Order).filter(
        models.Order.status.not_in(["Completed", "Served", "Delivered", "Cancelled"])
    ).order_by(models.Order.created_at.asc()).all()
    return orders

@router.patch("/orders/{order_id}/update-status", response_model=schemas.OrderResponse)
def update_kitchen_order_status(
    order_id: int, 
    new_status: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(kitchen_or_admin)
):
    allowed_statuses = [
        "Order Received", "Received", 
        "Order Confirmed", "Confirmed", "Accepted", 
        "Preparing", "Ready", 
        "Serving", "Out for Delivery", 
        "Served", "Delivered", "Completed"
    ]
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status for kitchen: {new_status}")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = new_status
    
    # Notify customer
    notif = models.Notification(
        user_id=order.user_id,
        title=f"Kitchen Update: {new_status}",
        message=f"Order #{order.order_number} is now {new_status}!"
    )
    db.add(notif)
    db.commit()
    db.refresh(order)
    return order
