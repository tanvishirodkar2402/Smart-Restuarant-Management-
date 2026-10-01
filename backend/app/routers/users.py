from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, RoleChecker, get_password_hash

router = APIRouter(prefix="/users", tags=["User Management"])

admin_only = RoleChecker(["Admin"])

@router.get("/", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(admin_only)):
    return db.query(models.User).all()

@router.post("/", response_model=schemas.UserResponse)
def create_user_by_admin(user_in: schemas.UserRegister, db: Session = Depends(get_db), current_user: models.User = Depends(admin_only)):
    if db.query(models.User).filter(models.User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    role = db.query(models.Role).filter(models.Role.name == user_in.role_name).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{user_in.role_name}' does not exist")

    new_user = models.User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role_id=role.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(admin_only)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} deleted successfully"}
