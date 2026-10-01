from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, date, time

# Role Schemas
class RoleSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# User Schemas
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    role_name: Optional[str] = "Customer"

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: RoleSchema
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "Utensils"
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Food Item Schemas
class FoodIngredientLink(BaseModel):
    ingredient_id: int
    quantity_required: float

class FoodItemBase(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_available: bool = True
    is_vegetarian: bool = False
    is_spicy: bool = False
    prep_time_minutes: int = 15

class FoodItemCreate(FoodItemBase):
    ingredients: Optional[List[FoodIngredientLink]] = []

class FoodItemResponse(FoodItemBase):
    id: int
    rating_avg: float
    category: Optional[CategoryResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Table Schemas
class TableBase(BaseModel):
    table_number: str
    capacity: int
    location: str = "Main Dining"
    status: str = "Available" # Available, Occupied, Reserved, Booked, Maintenance

class TableCreate(TableBase):
    pass

class TableResponse(TableBase):
    id: int
    qr_code_token: Optional[str] = None
    qr_code: Optional[str] = None
    qr_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Reservation & TableBooking Schemas
class ReservationCreate(BaseModel):
    table_id: int
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    booking_date: date
    booking_time: str # "19:30" format
    guest_count: Optional[int] = 2
    guests: Optional[int] = None
    special_requests: Optional[str] = None
    special_request: Optional[str] = None

class ReservationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    table_id: int
    customer_name: Optional[str] = "Guest"
    phone: Optional[str] = ""
    reservation_date: date
    reservation_time: time
    guest_count: int
    guests: int
    special_requests: Optional[str] = None
    special_request: Optional[str] = None
    status: str
    booking_status: str
    user: Optional[UserResponse] = None
    table: Optional[TableResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Offer Schemas
class OfferBase(BaseModel):
    code: str
    title: str
    description: Optional[str] = None
    discount_percent: float = 0.0
    fixed_discount: float = 0.0
    min_order_amount: float = 0.0
    valid_until: Optional[datetime] = None
    is_active: bool = True

class OfferCreate(OfferBase):
    pass

class OfferResponse(OfferBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    food_item_id: int
    quantity: int
    special_instructions: Optional[str] = None

class OrderCreate(BaseModel):
    table_id: Optional[int] = None
    order_type: str = "Dine-In" # Dine-In, Takeaway, Delivery
    payment_method: str = "Card"
    coupon_code: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: int
    food_item_id: int
    quantity: int
    unit_price: float
    subtotal: float
    special_instructions: Optional[str] = None
    food_item: Optional[FoodItemResponse] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    table_id: Optional[int] = None
    order_type: str
    status: str
    subtotal: float
    discount_amount: float
    tax_amount: float
    total_amount: float
    payment_status: str
    payment_method: str
    estimated_minutes: Optional[int] = 20
    expected_ready_time: Optional[datetime] = None
    notes: Optional[str] = None
    user: Optional[UserResponse] = None
    table: Optional[TableResponse] = None
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Review Schemas
class ReviewCreate(BaseModel):
    food_item_id: Optional[int] = None
    order_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    food_item_id: Optional[int] = None
    order_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None
    user: Optional[UserResponse] = None
    food_item: Optional[FoodItemResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Inventory Schemas
class IngredientBase(BaseModel):
    name: str
    unit: str
    current_stock: float
    reorder_level: float = 5.0
    cost_per_unit: float = 0.0

class IngredientCreate(IngredientBase):
    pass

class IngredientResponse(IngredientBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class StockUpdate(BaseModel):
    quantity_change: float # Positive for add, negative for deduct
    notes: Optional[str] = "Manual Stock Adjustment"

class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# AI Chat & Voice Query
class AIChatRequest(BaseModel):
    message: str

class AIChatResponse(BaseModel):
    reply: str
    recommended_items: Optional[List[FoodItemResponse]] = []
    parsed_intent: Optional[str] = None
    order_data: Optional[OrderResponse] = None

