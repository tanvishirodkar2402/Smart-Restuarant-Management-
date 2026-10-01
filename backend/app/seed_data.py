from datetime import date, time, datetime, timedelta
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash

def init_db_seed(db: Session):
    # 1. Roles
    if db.query(models.Role).first() is None:
        print("Seeding default roles...")
        roles_data = [
            models.Role(id=1, name="Admin", description="System Administrator with full access"),
            models.Role(id=2, name="Restaurant Staff", description="Front-of-house staff managing orders and tables"),
            models.Role(id=3, name="Kitchen Staff", description="Kitchen chefs and cooks handling order preparation"),
            models.Role(id=4, name="Customer", description="Restaurant guests and online customers"),
        ]
        db.add_all(roles_data)
        db.commit()

    # 2. Users
    if db.query(models.User).first() is None:
        print("Seeding default users...")
        hashed_pwd = get_password_hash("password123")
        users_data = [
            models.User(id=1, username="admin", email="admin@smartrestaurant.com", password_hash=hashed_pwd, full_name="Alexander Wright", phone="+1 (555) 019-2831", role_id=1),
            models.User(id=2, username="staff_sarah", email="sarah@smartrestaurant.com", password_hash=hashed_pwd, full_name="Sarah Jenkins", phone="+1 (555) 019-4820", role_id=2),
            models.User(id=3, username="chef_marco", email="marco@smartrestaurant.com", password_hash=hashed_pwd, full_name="Chef Marco Rossi", phone="+1 (555) 019-9943", role_id=3),
            models.User(id=4, username="john_doe", email="john@example.com", password_hash=hashed_pwd, full_name="John Doe", phone="+1 (555) 012-3456", role_id=4),
            models.User(id=5, username="emily_smith", email="emily@example.com", password_hash=hashed_pwd, full_name="Emily Smith", phone="+1 (555) 014-9876", role_id=4),
        ]
        db.add_all(users_data)
        db.commit()

    # 3. Categories & Food Items
    if db.query(models.Category).first() is None:
        print("Seeding categories and food items...")
        categories_data = [
            models.Category(id=1, name="Veg Starters", description="Crispy, spiced vegetarian starters & appetizers", icon="Leaf"),
            models.Category(id=2, name="Non-Veg Starters", description="Sizzling, grilled & fried non-vegetarian starters", icon="Flame"),
            models.Category(id=3, name="Veg Main Course", description="Rich vegetarian gravies, curries & rice bowls", icon="UtensilsCrossed"),
            models.Category(id=4, name="Non-Veg Main Course", description="Gourmet chicken, mutton, seafood & steak specialties", icon="Beef"),
            models.Category(id=5, name="Artisanal Pizzas & Pasta", description="Handcrafted wood-fired pizzas and fresh pastas", icon="Pizza"),
            models.Category(id=6, name="Sweets & Desserts", description="Decadent sweets, warm cakes & artisanal gelatos", icon="Cake"),
            models.Category(id=7, name="Fresh Juices & Smoothies", description="100% natural fruit juices, detox blends & smoothies", icon="Coffee"),
            models.Category(id=8, name="Cocktails & Mocktails", description="Crafted cocktails, spirits & refreshing mocktails", icon="Sparkles"),
        ]
        db.add_all(categories_data)
        db.commit()

        # 4. Food Items
        food_items_data = [
            # Veg Starters (Category 1)
            models.FoodItem(id=1, category_id=1, name="Charcoal Paneer Tikka", description="Juicy cottage cheese cubes marinated in spiced yogurt, smoked garlic, and clay-oven grilled with bell peppers", price=199.00, image_url="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=True, prep_time_minutes=15, rating_avg=4.85),
            models.FoodItem(id=2, category_id=1, name="Truffle Mushroom Bruschetta", description="Crispy sourdough topped with sautéed wild mushrooms, truffle oil, and parmesan shavings", price=179.00, image_url="https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=12, rating_avg=4.80),
            models.FoodItem(id=3, category_id=1, name="Crispy Veg Spring Rolls", description="Golden fried rolls stuffed with crunchy glass noodles, mushrooms, and Asian veggies with sweet chili dip", price=129.00, image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=10, rating_avg=4.65),
            models.FoodItem(id=4, category_id=1, name="Honey Chili Crispy Cauliflower", description="Battered crispy cauliflower florets tossed in sweet honey chili garlic glaze with sesame seeds", price=149.00, image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=True, prep_time_minutes=12, rating_avg=4.75),
            models.FoodItem(id=5, category_id=1, name="Hara Bhara Kebab", description="Spinach, green peas, and cottage cheese patties flavored with royal spices & mint chutney", price=139.00, image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=12, rating_avg=4.70),
            models.FoodItem(id=6, category_id=1, name="Crispy Chili Garlic Corn", description="Tender sweet corn tossed with bell peppers, spring onions, and roasted garlic chili seasoning", price=119.00, image_url="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=True, prep_time_minutes=10, rating_avg=4.68),

            # Non-Veg Starters (Category 2)
            models.FoodItem(id=7, category_id=2, name="Crispy Calamari Rings", description="Golden fried squid served with homemade spicy garlic aioli and fresh lemon wedges", price=229.00, image_url="https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=True, prep_time_minutes=15, rating_avg=4.70),
            models.FoodItem(id=8, category_id=2, name="Fiery Buffalo Chicken Wings", description="Juicy fried wings tossed in fiery cayenne buffalo sauce served with blue cheese dip and celery", price=199.00, image_url="https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=True, prep_time_minutes=15, rating_avg=4.80),
            models.FoodItem(id=9, category_id=2, name="Tandoori Murgh Tikka", description="Boneless chicken chunks marinated in aromatic Indian spices and clay-oven grilled to perfection", price=219.00, image_url="https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=True, prep_time_minutes=18, rating_avg=4.90),
            models.FoodItem(id=10, category_id=2, name="Butterfly Golden Prawns", description="Jumbo prawns coated in crunchy Japanese panko crumbs served with zesty tartar dip", price=249.00, image_url="https://images.unsplash.com/photo-1559742811-822863c46f83?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=False, prep_time_minutes=15, rating_avg=4.85),
            models.FoodItem(id=11, category_id=2, name="Spiced Chicken Lollipop", description="Frenched chicken drumettes marinated in fiery ginger-garlic paste and deep fried golden", price=189.00, image_url="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=True, prep_time_minutes=15, rating_avg=4.82),
            models.FoodItem(id=12, category_id=2, name="Royal Mutton Seekh Kebab", description="Minced lamb mixed with aromatic spices, fresh herbs, and clay-oven grilled on skewers", price=249.00, image_url="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=True, prep_time_minutes=20, rating_avg=4.88),

            # Veg Main Course (Category 3)
            models.FoodItem(id=13, category_id=3, name="Royal Paneer Butter Masala", description="Rich cottage cheese cubes in silky tomato butter cream gravy infused with fragrant kasuri methi", price=229.00, image_url="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=18, rating_avg=4.90),
            models.FoodItem(id=14, category_id=3, name="Slow-Cooked Dal Makhani", description="Black lentils simmered overnight with butter, cream, and slow-roasted aromatic herbs", price=189.00, image_url="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=15, rating_avg=4.95),
            models.FoodItem(id=15, category_id=3, name="Wild Mushroom Risotto", description="Arborio rice cooked in rich vegetable broth with parmesan, wild mushrooms, and truffle oil glaze", price=249.00, image_url="https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=20, rating_avg=4.80),
            models.FoodItem(id=16, category_id=3, name="Hyderabadi Veg Dum Biryani", description="Aromatic long-grain basmati rice layered with spiced garden vegetables, saffron, mint, and fried onions", price=199.00, image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=True, prep_time_minutes=22, rating_avg=4.75),
            models.FoodItem(id=17, category_id=3, name="Creamy Shahi Malai Kofta", description="Delicate cottage cheese & dumpling balls simmered in rich cashew cream sauce", price=219.00, image_url="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=18, rating_avg=4.87),
            models.FoodItem(id=18, category_id=3, name="Spicy Kadhai Paneer Special", description="Fresh paneer cubes cooked with crushed coriander seeds, capsicum, and roasted chili gravy", price=219.00, image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=True, prep_time_minutes=16, rating_avg=4.82),

            # Non-Veg Main Course (Category 4)
            models.FoodItem(id=19, category_id=4, name="Classic Murgh Butter Chicken", description="Tender tandoori chicken cooked in velvety tomato, butter, and cashew cream gravy", price=269.00, image_url="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=False, prep_time_minutes=20, rating_avg=4.95),
            models.FoodItem(id=20, category_id=4, name="Kashmiri Mutton Rogan Josh", description="Slow-braised tender lamb shanks in rich red chili, fennel, and aromatic Kashmiri gravy", price=329.00, image_url="https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=True, prep_time_minutes=25, rating_avg=4.90),
            models.FoodItem(id=21, category_id=4, name="Grilled Norwegian Salmon Steak", description="Pan-seared salmon served over garlic mashed potatoes and asparagus with lemon dill butter sauce", price=349.00, image_url="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=False, prep_time_minutes=20, rating_avg=4.88),
            models.FoodItem(id=22, category_id=4, name="Hyderabadi Chicken Dum Biryani", description="Fragrant basmati rice slow-cooked on dum with marinated tender chicken and rich spices", price=249.00, image_url="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=True, prep_time_minutes=25, rating_avg=4.92),
            models.FoodItem(id=23, category_id=4, name="Signature Prime Angus Steak", description="Grilled 250g Angus ribeye steak served with truffle fries, grilled veggies, and garlic herb butter", price=349.00, image_url="https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=False, prep_time_minutes=22, rating_avg=4.90),
            models.FoodItem(id=24, category_id=4, name="Goan Coconut Prawn Curry", description="Tiger prawns simmered in aromatic coconut cream, kokum, and Goan spices", price=299.00, image_url="https://images.unsplash.com/photo-1559742811-822863c46f83?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=True, prep_time_minutes=20, rating_avg=4.86),

            # Artisanal Pizzas & Pasta (Category 5)
            models.FoodItem(id=25, category_id=5, name="Margherita Supreme Pizza", description="San Marzano tomato base, fresh buffalo mozzarella, fragrant basil, and extra virgin olive oil", price=249.00, image_url="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=18, rating_avg=4.90),
            models.FoodItem(id=26, category_id=5, name="Spicy Pepperoni & Hot Honey Pizza", description="Crispy cupping pepperoni, aged mozzarella, chili flakes, drizzled with spicy wild honey", price=299.00, image_url="https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=True, prep_time_minutes=20, rating_avg=4.95),
            models.FoodItem(id=27, category_id=5, name="Classic Fettuccine Alfredo", description="Handmade fettuccine ribbons in a rich Parmigiano-Reggiano cream sauce with toasted garlic", price=229.00, image_url="https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=15, rating_avg=4.75),
            models.FoodItem(id=28, category_id=5, name="Penne Arrabbiata Piccante", description="Penne pasta tossed in fiery garlic, San Marzano tomatoes, chili flakes, and fresh basil", price=219.00, image_url="https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=True, prep_time_minutes=14, rating_avg=4.78),
            models.FoodItem(id=29, category_id=5, name="Smoky BBQ Chicken Pizza", description="Grilled chicken, red onions, smoked cheddar, coriander, and sweet BBQ sauce glaze", price=319.00, image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=False, is_spicy=False, prep_time_minutes=20, rating_avg=4.89),

            # Sweets & Desserts (Category 6)
            models.FoodItem(id=30, category_id=6, name="Molten Chocolate Lava Cake", description="Warm Belgian chocolate cake with an oozing rich center served with Madagascar vanilla gelato", price=149.00, image_url="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=12, rating_avg=4.95),
            models.FoodItem(id=31, category_id=6, name="Classic Italian Tiramisu", description="Savoiardi ladyfingers soaked in espresso and dark rum layered with mascarpone cream", price=139.00, image_url="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=8, rating_avg=4.90),
            models.FoodItem(id=32, category_id=6, name="Royal Shahi Gulab Jamun with Kulfi", description="Warm cardamom milk dumplings in saffron sugar syrup served with rich pistachio kulfi", price=119.00, image_url="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=6, rating_avg=4.88),
            models.FoodItem(id=33, category_id=6, name="Alphonso Mango Cheesecake", description="Creamy slow-baked New York cheesecake topped with fresh Alphonso mango compote glaze", price=129.00, image_url="https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.85),
            models.FoodItem(id=34, category_id=6, name="Cardamom Saffron Rasmalai", description="Soft cottage cheese discs soaked in chilled saffron-infused cardamom milk with pistachios", price=109.00, image_url="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.91),
            models.FoodItem(id=35, category_id=6, name="Belgian Chocolate Brownie Sundae", description="Fudgy dark chocolate brownie topped with Madagascar vanilla ice cream and hot fudge", price=139.00, image_url="https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=8, rating_avg=4.87),

            # Fresh Juices & Smoothies (Category 7)
            models.FoodItem(id=36, category_id=7, name="Fresh Watermelon Mint Cooler", description="100% cold-pressed watermelon juice with fresh mint leaves and lime juice", price=79.00, image_url="https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.85),
            models.FoodItem(id=37, category_id=7, name="Tropical Mango Passion Smoothie", description="Blended Alphonso mango, passionfruit, organic Greek yogurt, and wildflower honey", price=99.00, image_url="https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.90),
            models.FoodItem(id=38, category_id=7, name="Green Goddess Detox Blend", description="Cold-pressed cucumber, green apple, celery, spinach, ginger, and fresh lemon", price=89.00, image_url="https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.75),
            models.FoodItem(id=39, category_id=7, name="Fresh Squeezed Valencia Orange Juice", description="Pure cold-pressed Valencia oranges packed with natural vitamin C and sweet tangy flavor", price=79.00, image_url="https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.88),
            models.FoodItem(id=40, category_id=7, name="Iced Salted Caramel Macchiato", description="Cold brewed espresso layered with salted caramel syrup and velvety oat milk", price=99.00, image_url="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.85),

            # Cocktails & Mocktails (Category 8)
            models.FoodItem(id=41, category_id=8, name="Passion Fruit Mint Spritzer", description="Fresh passion fruit puree, crushed mint, lime juice, and sparkling soda water", price=99.00, image_url="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.80),
            models.FoodItem(id=42, category_id=8, name="Smoked Bourbon Old Fashioned", description="Aged Kentucky bourbon whiskey, Angostura bitters, orange zest, infused with applewood smoke", price=199.00, image_url="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=6, rating_avg=4.92),
            models.FoodItem(id=43, category_id=8, name="Classic Cuban Rum Mojito", description="White rum, fresh muddled lime, mint leaves, cane sugar, and a splash of sparkling soda", price=169.00, image_url="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.88),
            models.FoodItem(id=44, category_id=8, name="Velvety Espresso Martini", description="Freshly pulled espresso shot, premium vodka, Kahlúa coffee liqueur, garnished with roasted beans", price=189.00, image_url="https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=6, rating_avg=4.95),
            models.FoodItem(id=45, category_id=8, name="Electric Blue Lagoon Mocktail", description="Refreshing blue curaçao, fresh lemon juice, mint, and sparkling soda", price=99.00, image_url="https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.82),
            models.FoodItem(id=46, category_id=8, name="Tropical Piña Colada", description="Creamy coconut cream, pineapple juice, and aged white rum served over crushed ice", price=159.00, image_url="https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=600&q=80", is_available=True, is_vegetarian=True, is_spicy=False, prep_time_minutes=5, rating_avg=4.89),
        ]
        db.add_all(food_items_data)
        db.commit()

    # 5. Restaurant Tables
    tables_data = [
        models.RestaurantTable(id=1, table_number="T-01", capacity=2, location="Window Side", status="Available", qr_code_token="QR-T01-7891"),
        models.RestaurantTable(id=2, table_number="T-02", capacity=4, location="Main Dining Hall", status="Booked", qr_code_token="QR-T02-4512"),
        models.RestaurantTable(id=3, table_number="T-03", capacity=4, location="Main Dining Hall", status="Available", qr_code_token="QR-T03-9031"),
        models.RestaurantTable(id=4, table_number="T-04", capacity=6, location="VIP Terrace", status="Reserved", qr_code_token="QR-T04-3321"),
        models.RestaurantTable(id=5, table_number="T-05", capacity=8, location="Private Dining Room", status="Available", qr_code_token="QR-T05-1104"),
    ]
    db.add_all(tables_data)
    db.commit()

    # 6. Offers
    offers_data = [
        models.Offer(id=1, code="WELCOME15", title="15% Off First Order", description="Enjoy 15% discount on your first order", discount_percent=15.00, fixed_discount=0.00, min_order_amount=250.00, valid_until=datetime.now() + timedelta(days=90), is_active=True),
        models.Offer(id=2, code="TASTY200", title="₹200 Flat Discount", description="₹200 off on orders over ₹1000", discount_percent=0.00, fixed_discount=200.00, min_order_amount=1000.00, valid_until=datetime.now() + timedelta(days=90), is_active=True),
        models.Offer(id=3, code="PIZZALOVE", title="10% Off Pizzas", description="Special discount on artisanal pizza combos", discount_percent=10.00, fixed_discount=0.00, min_order_amount=300.00, valid_until=datetime.now() + timedelta(days=90), is_active=True),
    ]
    db.add_all(offers_data)
    db.commit()

    # 7. Reservations
    reservations_data = [
        models.Reservation(id=1, user_id=4, table_id=4, reservation_date=date.today(), reservation_time=time(19, 30), guest_count=4, special_requests="Anniversary dinner setup with candlelight", status="Confirmed"),
        models.Reservation(id=2, user_id=5, table_id=1, reservation_date=date.today(), reservation_time=time(20, 0), guest_count=2, special_requests="Quiet table near window", status="Confirmed"),
    ]
    db.add_all(reservations_data)
    db.commit()

    # 8. Ingredients & Recipe mappings
    ingredients_data = [
        models.Ingredient(id=1, name="Mozzarella Cheese", unit="kg", current_stock=25.50, reorder_level=10.00, cost_per_unit=8.50),
        models.Ingredient(id=2, name="San Marzano Tomato Sauce", unit="liters", current_stock=40.00, reorder_level=12.00, cost_per_unit=4.20),
        models.Ingredient(id=3, name="Pizza Dough Flour", unit="kg", current_stock=100.00, reorder_level=25.00, cost_per_unit=2.10),
        models.Ingredient(id=4, name="Pepperoni Slices", unit="kg", current_stock=12.00, reorder_level=4.00, cost_per_unit=14.00),
        models.Ingredient(id=5, name="Angus Beef Patties", unit="units", current_stock=45.00, reorder_level=15.00, cost_per_unit=5.50),
        models.Ingredient(id=6, name="Brioche Buns", unit="units", current_stock=50.00, reorder_level=20.00, cost_per_unit=1.20),
        models.Ingredient(id=7, name="Wild Mushrooms", unit="kg", current_stock=3.50, reorder_level=5.00, cost_per_unit=11.00), # Low stock alert!
        models.Ingredient(id=8, name="Truffle Oil", unit="liters", current_stock=4.50, reorder_level=1.00, cost_per_unit=35.00),
        models.Ingredient(id=9, name="Heavy Cream", unit="liters", current_stock=18.00, reorder_level=5.00, cost_per_unit=3.80),
        models.Ingredient(id=10, name="Fettuccine Pasta", unit="kg", current_stock=30.00, reorder_level=8.00, cost_per_unit=2.90),
    ]
    db.add_all(ingredients_data)
    db.commit()

    recipe_data = [
        models.FoodIngredient(food_item_id=1, ingredient_id=7, quantity_required=0.15),
        models.FoodIngredient(food_item_id=1, ingredient_id=8, quantity_required=0.02),
        models.FoodIngredient(food_item_id=3, ingredient_id=1, quantity_required=0.20),
        models.FoodIngredient(food_item_id=3, ingredient_id=2, quantity_required=0.15),
        models.FoodIngredient(food_item_id=3, ingredient_id=3, quantity_required=0.25),
        models.FoodIngredient(food_item_id=4, ingredient_id=1, quantity_required=0.20),
        models.FoodIngredient(food_item_id=4, ingredient_id=2, quantity_required=0.15),
        models.FoodIngredient(food_item_id=4, ingredient_id=3, quantity_required=0.25),
        models.FoodIngredient(food_item_id=4, ingredient_id=4, quantity_required=0.12),
        models.FoodIngredient(food_item_id=5, ingredient_id=5, quantity_required=1.00),
        models.FoodIngredient(food_item_id=5, ingredient_id=6, quantity_required=1.00),
        models.FoodIngredient(food_item_id=7, ingredient_id=9, quantity_required=0.15),
        models.FoodIngredient(food_item_id=7, ingredient_id=10, quantity_required=0.20),
    ]
    db.add_all(recipe_data)
    db.commit()

    # 9. Suppliers
    suppliers_data = [
        models.Supplier(id=1, name="Roma Gourmet Dairy Co.", contact_person="Gianni Bellini", phone="+1 (555) 882-1920", email="orders@romadairy.com", address="142 Alpine Way, Industrial Zone"),
        models.Supplier(id=2, name="Prime Select Meats", contact_person="Dave Miller", phone="+1 (555) 771-9031", email="sales@primemeats.com", address="88 Meatpackers Blvd, Logistics Hub"),
        models.Supplier(id=3, name="Fresh Farm Produce Distributors", contact_person="Clara Vance", phone="+1 (555) 443-8812", email="info@freshfarmpd.com", address="99 Organic Drive, Valley View"),
    ]
    db.add_all(suppliers_data)
    db.commit()

    # 10. Orders
    order1 = models.Order(
        id=1, order_number="ORD-20261001-001", user_id=4, table_id=2, 
        order_type="Dine-In", status="Preparing", subtotal=40.49, discount_amount=0.00, 
        tax_amount=3.24, total_amount=43.73, payment_status="Paid", payment_method="Card", 
        notes="Extra napkins requested"
    )
    order2 = models.Order(
        id=2, order_number="ORD-20261001-002", user_id=5, table_id=None, 
        order_type="Delivery", status="Received", subtotal=28.49, discount_amount=4.27, 
        tax_amount=2.28, total_amount=26.50, payment_status="Pending", payment_method="UPI", 
        notes="Leave at front door"
    )
    db.add_all([order1, order2])
    db.commit()

    # Order Items
    order_items_data = [
        models.OrderItem(order_id=1, food_item_id=3, quantity=1, unit_price=18.99, subtotal=18.99, special_instructions="Well done crust"),
        models.OrderItem(order_id=1, food_item_id=4, quantity=1, unit_price=21.50, subtotal=21.50, special_instructions="Extra spicy honey drizzle"),
        models.OrderItem(order_id=2, food_item_id=5, quantity=1, unit_price=19.50, subtotal=19.50, special_instructions="Medium rare patty"),
        models.OrderItem(order_id=2, food_item_id=11, quantity=1, unit_price=8.99, subtotal=8.99, special_instructions="Extra vanilla scoop"),
    ]
    db.add_all(order_items_data)
    db.commit()

    # Reviews
    reviews_data = [
        models.Review(id=1, user_id=4, food_item_id=3, order_id=1, rating=5, comment="The Margherita Supreme was out of this world! Incredible authentic flavor."),
        models.Review(id=2, user_id=5, food_item_id=5, order_id=2, rating=4, comment="Juicy burger and crisp truffle fries. Delivery was quick too."),
    ]
    db.add_all(reviews_data)
    db.commit()

    print("Database seeding completed successfully!")
