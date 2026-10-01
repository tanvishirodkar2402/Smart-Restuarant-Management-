from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import RoleChecker

router = APIRouter(prefix="/categories", tags=["Categories"])
admin_or_staff = RoleChecker(["Admin", "Restaurant Staff"])

@router.get("/", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).filter(models.Category.is_active == True).all()

@router.post("/", response_model=schemas.CategoryResponse)
def create_category(cat_in: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(admin_or_staff)):
    existing = db.query(models.Category).filter(models.Category.name == cat_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")
    
    category = models.Category(**cat_in.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{cat_id}", response_model=schemas.CategoryResponse)
def update_category(cat_id: int, cat_in: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(admin_or_staff)):
    category = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in cat_in.dict().items():
        setattr(category, key, value)
    
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(admin_or_staff)):
    category = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted"}
