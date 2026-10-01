from datetime import datetime, time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, get_current_user_optional, RoleChecker

router = APIRouter(prefix="/reservations", tags=["Reservations"])
staff_or_admin = RoleChecker(["Admin", "Restaurant Staff"])

@router.get("/my", response_model=List[schemas.ReservationResponse])
def get_user_reservations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Reservation).filter(models.Reservation.user_id == current_user.id).order_by(models.Reservation.created_at.desc()).all()

@router.get("/", response_model=List[schemas.ReservationResponse])
def get_all_reservations(db: Session = Depends(get_db), current_user: models.User = Depends(staff_or_admin)):
    return db.query(models.Reservation).order_by(models.Reservation.created_at.desc()).all()

@router.post("/", response_model=schemas.ReservationResponse)
def create_reservation(
    res_in: schemas.ReservationCreate, 
    db: Session = Depends(get_db), 
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == res_in.table_id).first()
    if not table:
        table = db.query(models.RestaurantTable).filter(models.RestaurantTable.table_number == str(res_in.table_id)).first()
    if not table:
        raise HTTPException(status_code=404, detail="Selected table does not exist")

    target_table_id = table.id

    if table.status in ["Occupied", "Maintenance"]:
        raise HTTPException(status_code=400, detail="This table is currently unavailable for booking. Please choose another table.")

    # Parse time string "19:30"
    try:
        res_time = datetime.strptime(res_in.booking_time, "%H:%M").time()
    except ValueError:
        try:
            res_time = datetime.strptime(res_in.booking_time, "%H:%M:%S").time()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM")

    # Double Booking Prevention Check
    existing_bookings = db.query(models.Reservation).filter(
        models.Reservation.table_id == target_table_id,
        models.Reservation.reservation_date == res_in.booking_date,
        models.Reservation.status != "Cancelled"
    ).all()

    new_datetime = datetime.combine(res_in.booking_date, res_time)
    for existing in existing_bookings:
        existing_datetime = datetime.combine(existing.reservation_date, existing.reservation_time)
        time_diff = abs((new_datetime - existing_datetime).total_seconds())
        # If booking is within 2 hours of an existing booking on the same table
        if time_diff < 7200:
            raise HTTPException(
                status_code=400,
                detail="This table is unavailable for the selected time. Please choose another time or table."
            )

    customer_name = res_in.customer_name or (current_user.full_name if current_user else "Guest Customer")
    phone = res_in.phone or (current_user.phone if current_user else "")
    guest_cnt = res_in.guests if res_in.guests is not None else (res_in.guest_count or 2)
    sp_req = res_in.special_request or res_in.special_requests or ""

    reservation = models.Reservation(
        user_id=current_user.id if current_user else None,
        table_id=target_table_id,
        customer_name=customer_name,
        phone=phone,
        reservation_date=res_in.booking_date,
        reservation_time=res_time,
        guest_count=guest_cnt,
        special_requests=sp_req,
        status="Confirmed"
    )
    
    table.status = "Booked"
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation

@router.patch("/{res_id}/status")
def update_reservation_status(
    res_id: int, 
    status: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(staff_or_admin)
):
    res = db.query(models.Reservation).filter(models.Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    res.status = status
    if status in ["Cancelled", "Completed"]:
        if res.table:
            res.table.status = "Available"
    elif status == "Seated":
        if res.table:
            res.table.status = "Occupied"

    db.commit()
    return {"message": f"Reservation status updated to {status}"}

@router.delete("/{res_id}")
def delete_reservation(
    res_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(staff_or_admin)
):
    res = db.query(models.Reservation).filter(models.Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if res.table and res.table.status == "Booked":
        res.table.status = "Available"

    db.delete(res)
    db.commit()
    return {"message": "Reservation deleted successfully"}
