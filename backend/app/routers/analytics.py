from datetime import date, datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models
from app.auth import RoleChecker

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])
admin_only = RoleChecker(["Admin", "Restaurant Staff"])

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(admin_only)):
    today = date.today()

    # 1. Total Revenue
    total_revenue = db.query(func.sum(models.Order.total_amount)).filter(models.Order.status != "Cancelled").scalar() or 0.0

    # 2. Today's orders count & revenue
    todays_orders_count = db.query(models.Order).filter(
        func.date(models.Order.created_at) == today
    ).count()

    # 3. Pending Orders (Received, Accepted, Preparing)
    pending_orders_count = db.query(models.Order).filter(
        models.Order.status.in_(["Received", "Accepted", "Preparing"])
    ).count()

    # 4. Completed Orders
    completed_orders_count = db.query(models.Order).filter(
        models.Order.status == "Completed"
    ).count()

    # 5. Available Tables vs Occupied Tables
    available_tables = db.query(models.RestaurantTable).filter(models.RestaurantTable.status == "Available").count()
    total_tables = db.query(models.RestaurantTable).count()

    # 6. Low stock ingredients alert count
    low_stock_count = db.query(models.Ingredient).filter(
        models.Ingredient.current_stock <= models.Ingredient.reorder_level
    ).count()

    # 7. Popular Food Items (Top 5 ordered)
    top_items_raw = db.query(
        models.FoodItem.name,
        func.sum(models.OrderItem.quantity).label("total_sold")
    ).join(models.OrderItem).group_by(models.FoodItem.id, models.FoodItem.name).order_by(
        func.sum(models.OrderItem.quantity).desc()
    ).limit(5).all()

    popular_items = [{"name": item[0], "total_sold": int(item[1])} for item in top_items_raw]

    # 8. Sales Trend (Last 7 Days)
    sales_chart = []
    for i in range(6, -1, -1):
        day_date = today - timedelta(days=i)
        day_str = day_date.strftime("%b %d")
        rev = db.query(func.sum(models.Order.total_amount)).filter(
            func.date(models.Order.created_at) == day_date,
            models.Order.status != "Cancelled"
        ).scalar() or 0.0
        cnt = db.query(models.Order).filter(
            func.date(models.Order.created_at) == day_date
        ).count()
        sales_chart.append({
            "date": day_str,
            "revenue": round(float(rev), 2),
            "orders": cnt
        })

    # 9. Revenue by Category
    cat_sales_raw = db.query(
        models.Category.name,
        func.sum(models.OrderItem.subtotal).label("revenue")
    ).join(models.FoodItem, models.FoodItem.category_id == models.Category.id)\
     .join(models.OrderItem, models.OrderItem.food_item_id == models.FoodItem.id)\
     .group_by(models.Category.name).all()

    category_sales = [{"category": c[0], "revenue": round(float(c[1]), 2)} for c in cat_sales_raw]

    return {
        "total_revenue": round(float(total_revenue), 2),
        "todays_orders": todays_orders_count,
        "pending_orders": pending_orders_count,
        "completed_orders": completed_orders_count,
        "available_tables": available_tables,
        "total_tables": total_tables,
        "low_stock_alerts": low_stock_count,
        "popular_items": popular_items,
        "sales_chart": sales_chart,
        "category_sales": category_sales
    }

@router.get("/feedback-sentiment")
def get_feedback_analysis(db: Session = Depends(get_db), current_user: models.User = Depends(admin_only)):
    reviews = db.query(models.Review).all()
    total_reviews = len(reviews)
    if total_reviews == 0:
        return {"positive": 0, "neutral": 0, "negative": 0, "average_rating": 0.0}

    positive = sum(1 for r in reviews if r.rating >= 4)
    neutral = sum(1 for r in reviews if r.rating == 3)
    negative = sum(1 for r in reviews if r.rating <= 2)
    avg_rating = sum(r.rating for r in reviews) / total_reviews

    return {
        "total_reviews": total_reviews,
        "positive_percent": round((positive / total_reviews) * 100, 1),
        "neutral_percent": round((neutral / total_reviews) * 100, 1),
        "negative_percent": round((negative / total_reviews) * 100, 1),
        "average_rating": round(avg_rating, 2)
    }
