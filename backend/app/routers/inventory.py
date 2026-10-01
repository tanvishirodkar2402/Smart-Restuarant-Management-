from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import RoleChecker

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])
admin_or_staff = RoleChecker(["Admin", "Restaurant Staff", "Kitchen Staff"])

# --- Ingredients ---
@router.get("/ingredients", response_model=List[schemas.IngredientResponse])
def get_all_ingredients(db: Session = Depends(get_db), current_user: models.User = Depends(admin_or_staff)):
    return db.query(models.Ingredient).all()

@router.get("/alerts", response_model=List[schemas.IngredientResponse])
def get_low_stock_alerts(db: Session = Depends(get_db), current_user: models.User = Depends(admin_or_staff)):
    # Returns items where current_stock <= reorder_level
    return db.query(models.Ingredient).filter(
        models.Ingredient.current_stock <= models.Ingredient.reorder_level
    ).all()

@router.post("/ingredients", response_model=schemas.IngredientResponse)
def create_ingredient(
    ing_in: schemas.IngredientCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    if db.query(models.Ingredient).filter(models.Ingredient.name == ing_in.name).first():
        raise HTTPException(status_code=400, detail="Ingredient already exists")
    
    ingredient = models.Ingredient(**ing_in.dict())
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)

    # Initial log
    tx = models.InventoryTransaction(
        ingredient_id=ingredient.id,
        transaction_type="IN",
        quantity=ing_in.current_stock,
        notes="Initial stock entry"
    )
    db.add(tx)
    db.commit()
    return ingredient

@router.post("/ingredients/{ing_id}/stock", response_model=schemas.IngredientResponse)
def update_ingredient_stock(
    ing_id: int, 
    stock_in: schemas.StockUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == ing_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    new_stock = float(ingredient.current_stock) + stock_in.quantity_change
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Resulting stock cannot be negative")

    ingredient.current_stock = new_stock

    tx_type = "IN" if stock_in.quantity_change >= 0 else "OUT"
    tx = models.InventoryTransaction(
        ingredient_id=ingredient.id,
        transaction_type=tx_type,
        quantity=abs(stock_in.quantity_change),
        notes=stock_in.notes
    )
    db.add(tx)
    db.commit()
    db.refresh(ingredient)
    return ingredient

# --- Suppliers ---
@router.get("/suppliers", response_model=List[schemas.SupplierResponse])
def get_suppliers(db: Session = Depends(get_db), current_user: models.User = Depends(admin_or_staff)):
    return db.query(models.Supplier).all()

@router.post("/suppliers", response_model=schemas.SupplierResponse)
def create_supplier(
    sup_in: schemas.SupplierCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    supplier = models.Supplier(**sup_in.dict())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

# --- Stock History ---
@router.get("/history")
def get_inventory_history(db: Session = Depends(get_db), current_user: models.User = Depends(admin_or_staff)):
    history = db.query(models.InventoryTransaction).order_by(models.InventoryTransaction.created_at.desc()).limit(100).all()
    res = []
    for tx in history:
        res.append({
            "id": tx.id,
            "ingredient_name": tx.ingredient.name if tx.ingredient else "Unknown",
            "transaction_type": tx.transaction_type,
            "quantity": float(tx.quantity),
            "unit": tx.ingredient.unit if tx.ingredient else "",
            "notes": tx.notes,
            "created_at": tx.created_at
        })
    return res
