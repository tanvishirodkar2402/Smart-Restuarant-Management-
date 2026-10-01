from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    username_clean = user_in.username.strip()
    email_clean = user_in.email.strip().lower()

    # Check if username or email exists
    if db.query(models.User).filter(models.User.username == username_clean).first():
        raise HTTPException(status_code=400, detail="Username already registered. Please choose another username or sign in.")
    if db.query(models.User).filter(models.User.email == email_clean).first():
        raise HTTPException(status_code=400, detail="Email address already registered. Please sign in with your account.")

    # Find role (default Customer)
    target_role_name = user_in.role_name or "Customer"
    role = db.query(models.Role).filter(models.Role.name == target_role_name).first()
    if not role:
        role = db.query(models.Role).filter(models.Role.name == "Customer").first()
    if not role:
        role = models.Role(name="Customer", description="Restaurant guests and online customers")
        db.add(role)
        db.commit()
        db.refresh(role)

    new_user = models.User(
        username=username_clean,
        email=email_clean,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        phone=user_in.phone.strip() if user_in.phone else None,
        role_id=role.id
    )
    db.add(new_user)
    db.commit()

    # Re-query user to ensure relationship attributes (role) are loaded
    user_loaded = db.query(models.User).filter(models.User.id == new_user.id).first()

    token = create_access_token({"sub": user_loaded.username})
    return {"access_token": token, "token_type": "bearer", "user": user_loaded}

@router.post("/login", response_model=schemas.Token)
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    identifier = login_in.username_or_email.strip()
    user = db.query(models.User).filter(
        (models.User.username == identifier) | 
        (models.User.email == identifier.lower())
    ).first()

    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
