from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import RoleChecker, get_current_user

router = APIRouter(prefix="/food-items", tags=["Food Items"])
admin_or_staff = RoleChecker(["Admin", "Restaurant Staff"])

@router.get("/", response_model=List[schemas.FoodItemResponse])
def get_food_items(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_vegetarian: Optional[bool] = None,
    is_spicy: Optional[bool] = None,
    is_available: Optional[bool] = None,
    sort_by: Optional[str] = "rating", # price_asc, price_desc, rating, name
    db: Session = Depends(get_db)
):
    query = db.query(models.FoodItem)
    
    if category_id:
        query = query.filter(models.FoodItem.category_id == category_id)
    if search:
        query = query.filter(
            (models.FoodItem.name.ilike(f"%{search}%")) |
            (models.FoodItem.description.ilike(f"%{search}%"))
        )
    if is_vegetarian is not None:
        query = query.filter(models.FoodItem.is_vegetarian == is_vegetarian)
    if is_spicy is not None:
        query = query.filter(models.FoodItem.is_spicy == is_spicy)
    if is_available is not None:
        query = query.filter(models.FoodItem.is_available == is_available)

    if sort_by == "price_asc":
        query = query.order_by(models.FoodItem.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(models.FoodItem.price.desc())
    elif sort_by == "name":
        query = query.order_by(models.FoodItem.name.asc())
    else: # rating
        query = query.order_by(models.FoodItem.rating_avg.desc())

    return query.all()

@router.get("/recommendations", response_model=List[schemas.FoodItemResponse])
def get_recommendations(db: Session = Depends(get_db)):
    # Smart feature: Returns top 4 highest rated available dishes & chef specials
    return db.query(models.FoodItem).filter(
        models.FoodItem.is_available == True
    ).order_by(models.FoodItem.rating_avg.desc()).limit(4).all()

@router.get("/{item_id}", response_model=schemas.FoodItemResponse)
def get_food_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.FoodItem).filter(models.FoodItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Food item not found")
    return item

@router.post("/", response_model=schemas.FoodItemResponse)
def create_food_item(
    item_in: schemas.FoodItemCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    food_data = item_in.dict(exclude={"ingredients"})
    food_item = models.FoodItem(**food_data)
    db.add(food_item)
    db.commit()
    db.refresh(food_item)

    # Link ingredients if provided
    if item_in.ingredients:
        for link in item_in.ingredients:
            recipe = models.FoodIngredient(
                food_item_id=food_item.id,
                ingredient_id=link.ingredient_id,
                quantity_required=link.quantity_required
            )
            db.add(recipe)
        db.commit()
        db.refresh(food_item)

    return food_item

@router.put("/{item_id}", response_model=schemas.FoodItemResponse)
def update_food_item(
    item_id: int, 
    item_in: schemas.FoodItemCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    food_item = db.query(models.FoodItem).filter(models.FoodItem.id == item_id).first()
    if not food_item:
        raise HTTPException(status_code=404, detail="Food item not found")

    food_data = item_in.dict(exclude={"ingredients"})
    for key, val in food_data.items():
        setattr(food_item, key, val)

    if item_in.ingredients is not None:
        db.query(models.FoodIngredient).filter(models.FoodIngredient.food_item_id == item_id).delete()
        for link in item_in.ingredients:
            recipe = models.FoodIngredient(
                food_item_id=food_item.id,
                ingredient_id=link.ingredient_id,
                quantity_required=link.quantity_required
            )
            db.add(recipe)

    db.commit()
    db.refresh(food_item)
    return food_item

@router.patch("/{item_id}/toggle-availability", response_model=schemas.FoodItemResponse)
def toggle_availability(
    item_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    food_item = db.query(models.FoodItem).filter(models.FoodItem.id == item_id).first()
    if not food_item:
        raise HTTPException(status_code=404, detail="Food item not found")
    food_item.is_available = not food_item.is_available
    db.commit()
    db.refresh(food_item)
    return food_item

@router.delete("/{item_id}")
def delete_food_item(
    item_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    food_item = db.query(models.FoodItem).filter(models.FoodItem.id == item_id).first()
    if not food_item:
        raise HTTPException(status_code=404, detail="Food item not found")
    db.delete(food_item)
    db.commit()
    return {"message": "Food item deleted successfully"}
