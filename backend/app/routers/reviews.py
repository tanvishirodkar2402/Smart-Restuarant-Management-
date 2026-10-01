from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])

@router.get("/", response_model=List[schemas.ReviewResponse])
def get_reviews(food_item_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Review)
    if food_item_id:
        query = query.filter(models.Review.food_item_id == food_item_id)
    return query.order_by(models.Review.created_at.desc()).all()

@router.post("/", response_model=schemas.ReviewResponse)
def submit_review(
    rev_in: schemas.ReviewCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    review = models.Review(
        user_id=current_user.id,
        food_item_id=rev_in.food_item_id,
        order_id=rev_in.order_id,
        rating=rev_in.rating,
        comment=rev_in.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate average rating for food item if applicable
    if rev_in.food_item_id:
        avg_rating = db.query(func.avg(models.Review.rating)).filter(
            models.Review.food_item_id == rev_in.food_item_id
        ).scalar()
        if avg_rating:
            food_item = db.query(models.FoodItem).filter(models.FoodItem.id == rev_in.food_item_id).first()
            if food_item:
                food_item.rating_avg = round(float(avg_rating), 2)
                db.commit()

    return review
