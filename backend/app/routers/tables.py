import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import RoleChecker

router = APIRouter(prefix="/tables", tags=["Restaurant Tables"])
admin_or_staff = RoleChecker(["Admin", "Restaurant Staff"])

@router.get("/", response_model=List[schemas.TableResponse])
def get_all_tables(db: Session = Depends(get_db)):
    return db.query(models.RestaurantTable).all()

@router.get("/qr/{qr_token}", response_model=schemas.TableResponse)
def get_table_by_qr(qr_token: str, db: Session = Depends(get_db)):
    table = db.query(models.RestaurantTable).filter(models.RestaurantTable.qr_code_token == qr_token).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table QR code token invalid or expired")
    return table

@router.get("/{table_id}", response_model=schemas.TableResponse)
def get_table_by_id(table_id: str, db: Session = Depends(get_db)):
    # Try numeric ID match first
    if str(table_id).isdigit():
        table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == int(table_id)).first()
        if table:
            return table

    # Try matching table_number exact or formatted ("1" -> "T-01" or "1")
    table = db.query(models.RestaurantTable).filter(models.RestaurantTable.table_number == str(table_id)).first()
    if not table and str(table_id).isdigit():
        formatted_num = f"T-{int(table_id):02d}"
        table = db.query(models.RestaurantTable).filter(models.RestaurantTable.table_number == formatted_num).first()

    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table

@router.post("/", response_model=schemas.TableResponse)
def create_table(
    table_in: schemas.TableCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    if db.query(models.RestaurantTable).filter(models.RestaurantTable.table_number == table_in.table_number).first():
        raise HTTPException(status_code=400, detail="Table number already exists")

    qr_token = f"QR-{table_in.table_number}-{uuid.uuid4().hex[:6].upper()}"
    table = models.RestaurantTable(**table_in.dict(), qr_code_token=qr_token)
    db.add(table)
    db.commit()
    db.refresh(table)
    return table

@router.put("/{table_id}", response_model=schemas.TableResponse)
def update_table(
    table_id: int, 
    table_in: schemas.TableCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    for key, val in table_in.dict().items():
        setattr(table, key, val)

    db.commit()
    db.refresh(table)
    return table

@router.patch("/{table_id}/status")
def update_table_status(
    table_id: int, 
    status: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    table.status = status
    db.commit()
    return {"message": f"Table status updated to {status}"}

@router.post("/{table_id}/generate-qr", response_model=schemas.TableResponse)
def generate_qr_code(
    table_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_or_staff)
):
    table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    table.qr_code_token = f"QR-{table.table_number}-{uuid.uuid4().hex[:6].upper()}"
    db.commit()
    db.refresh(table)
    return table

@router.delete("/{table_id}")
def delete_table(
    table_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(admin_or_staff)
):
    table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    db.delete(table)
    db.commit()
    return {"message": "Table deleted"}
