from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import RoleChecker

router = APIRouter(prefix="/offers", tags=["Offers & Coupons"])
admin_or_staff = RoleChecker(["Admin", "Restaurant Staff"])

@router.get("/", response_model=List[schemas.OfferResponse])
def get_all_offers(db: Session = Depends(get_db)):
    return db.query(models.Offer).filter(models.Offer.is_active == True).all()

@router.post("/", response_model=schemas.OfferResponse)
def create_offer(
    offer_in: schemas.OfferCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    if db.query(models.Offer).filter(models.Offer.code == offer_in.code).first():
        raise HTTPException(status_code=400, detail="Offer coupon code already exists")

    offer = models.Offer(**offer_in.dict())
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer

@router.post("/validate/{code}")
def validate_coupon(code: str, order_amount: float, db: Session = Depends(get_db)):
    offer = db.query(models.Offer).filter(models.Offer.code == code, models.Offer.is_active == True).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon code")
    if order_amount < float(offer.min_order_amount):
        raise HTTPException(status_code=400, detail=f"Minimum order amount for this coupon is ${offer.min_order_amount}")

    discount = 0.0
    if float(offer.discount_percent) > 0:
        discount = order_amount * (float(offer.discount_percent) / 100.0)
    elif float(offer.fixed_discount) > 0:
        discount = float(offer.fixed_discount)

    return {
        "valid": True,
        "code": offer.code,
        "title": offer.title,
        "discount_amount": discount
    }

@router.delete("/{offer_id}")
def delete_offer(offer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(admin_or_staff)):
    offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    db.delete(offer)
    db.commit()
    return {"message": "Offer deleted"}
