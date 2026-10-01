from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, Date, Time, 
    ForeignKey, Numeric, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    role = relationship("Role", back_populates="users")
    orders = relationship("Order", back_populates="user")
    reservations = relationship("Reservation", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), default="Utensils")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    food_items = relationship("FoodItem", back_populates="category", cascade="all, delete-orphan")


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True)
    is_vegetarian = Column(Boolean, default=False)
    is_spicy = Column(Boolean, default=False)
    prep_time_minutes = Column(Integer, default=15)
    rating_avg = Column(Numeric(3, 2), default=4.50)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="food_items")
    order_items = relationship("OrderItem", back_populates="food_item")
    reviews = relationship("Review", back_populates="food_item")
    food_ingredients = relationship("FoodIngredient", back_populates="food_item", cascade="all, delete-orphan")


class RestaurantTable(Base):
    __tablename__ = "restaurant_tables"

    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(String(20), unique=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    location = Column(String(100), default="Main Dining")
    status = Column(String(30), default="Available") # Available, Occupied, Reserved, Booked, Maintenance
    qr_code_token = Column(String(100), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reservations = relationship("Reservation", back_populates="table", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="table")

    @property
    def qr_code(self):
        return self.qr_code_token

    @property
    def qr_url(self):
        import os
        from app.config import settings
        base_url = os.getenv("FRONTEND_URL") or settings.FRONTEND_URL or "http://192.168.1.33:5173"
        return f"{base_url.rstrip('/')}/book/table/{self.id}"


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    table_id = Column(Integer, ForeignKey("restaurant_tables.id", ondelete="CASCADE"), nullable=False)
    customer_name = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    reservation_date = Column(Date, nullable=False)
    reservation_time = Column(Time, nullable=False)
    guest_count = Column(Integer, nullable=False)
    special_requests = Column(Text, nullable=True)
    status = Column(String(30), default="Confirmed") # Confirmed, Cancelled, Completed, Seated
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reservations")
    table = relationship("RestaurantTable", back_populates="reservations")

    @property
    def guests(self):
        return self.guest_count

    @property
    def special_request(self):
        return self.special_requests

    @property
    def booking_status(self):
        return self.status

    @property
    def booking_date(self):
        return self.reservation_date

    @property
    def booking_time(self):
        return self.reservation_time

# TableBookings alias for TableBookings database model requirement
TableBooking = Reservation


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    discount_percent = Column(Numeric(5, 2), default=0.00)
    fixed_discount = Column(Numeric(10, 2), default=0.00)
    min_order_amount = Column(Numeric(10, 2), default=0.00)
    valid_until = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    table_id = Column(Integer, ForeignKey("restaurant_tables.id", ondelete="SET NULL"), nullable=True)
    order_type = Column(String(30), default="Dine-In") # Dine-In, Takeaway, Delivery
    status = Column(String(50), default="Order Received") # Order Received, Order Confirmed, Preparing, Ready, Serving, Delivered, Completed, Cancelled
    subtotal = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0.00)
    tax_amount = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(String(30), default="Pending") # Pending, Paid, Refunded
    payment_method = Column(String(50), default="Card") # Cash, Card, UPI, Wallet
    estimated_minutes = Column(Integer, default=20)
    expected_ready_time = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    table = relationship("RestaurantTable", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order")

    @property
    def customer_id(self):
        return self.user_id

    @property
    def order_status(self):
        return self.status


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    special_instructions = Column(String(255), nullable=True)

    order = relationship("Order", back_populates="items")
    food_item = relationship("FoodItem", back_populates="order_items")

    @property
    def food_id(self):
        return self.food_item_id

    @property
    def price(self):
        return self.unit_price


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    payment_method = Column(String(50), nullable=False)
    transaction_id = Column(String(100), unique=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(30), default="Completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="payments")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="CASCADE"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reviews")
    food_item = relationship("FoodItem", back_populates="reviews")
    order = relationship("Order", back_populates="reviews")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    unit = Column(String(30), nullable=False) # kg, g, liters, units
    current_stock = Column(Numeric(10, 2), default=0.00)
    reorder_level = Column(Numeric(10, 2), default=5.00)
    cost_per_unit = Column(Numeric(10, 2), default=0.00)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    food_ingredients = relationship("FoodIngredient", back_populates="ingredient", cascade="all, delete-orphan")
    inventory_transactions = relationship("InventoryTransaction", back_populates="ingredient", cascade="all, delete-orphan")


class FoodIngredient(Base):
    __tablename__ = "food_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="CASCADE"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    quantity_required = Column(Numeric(10, 2), nullable=False)

    food_item = relationship("FoodItem", back_populates="food_ingredients")
    ingredient = relationship("Ingredient", back_populates="food_ingredients")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(String(30), nullable=False) # IN, OUT, ADJUSTMENT
    quantity = Column(Numeric(10, 2), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ingredient = relationship("Ingredient", back_populates="inventory_transactions")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
