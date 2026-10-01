-- Smart Restaurant Management System
-- Seed Data Script for MySQL

USE smart_restaurant;

-- Disable Foreign Key Checks for clean seed
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE inventory_transactions;
TRUNCATE TABLE food_ingredients;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE ingredients;
TRUNCATE TABLE reviews;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE offers;
TRUNCATE TABLE reservations;
TRUNCATE TABLE restaurant_tables;
TRUNCATE TABLE food_items;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'Admin', 'System Administrator with full access'),
(2, 'Restaurant Staff', 'Front-of-house staff managing orders and tables'),
(3, 'Kitchen Staff', 'Kitchen chefs and cooks handling order preparation'),
(4, 'Customer', 'Restaurant guests and online customers');

-- 2. Users (Passwords hashed using bcrypt for "password123": $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW)
INSERT INTO users (id, username, email, password_hash, full_name, phone, role_id) VALUES
(1, 'admin', 'admin@smartrestaurant.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Alexander Wright', '+1 (555) 019-2831', 1),
(2, 'staff_sarah', 'sarah@smartrestaurant.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Sarah Jenkins', '+1 (555) 019-4820', 2),
(3, 'chef_marco', 'marco@smartrestaurant.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Chef Marco Rossi', '+1 (555) 019-9943', 3),
(4, 'john_doe', 'john@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'John Doe', '+1 (555) 012-3456', 4),
(5, 'emily_smith', 'emily@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Emily Smith', '+1 (555) 014-9876', 4);

-- 3. Categories
INSERT INTO categories (id, name, description, icon) VALUES
(1, 'Veg Starters', 'Crispy, spiced vegetarian starters & appetizers', 'Leaf'),
(2, 'Non-Veg Starters', 'Sizzling, grilled & fried non-vegetarian starters', 'Flame'),
(3, 'Veg Main Course', 'Rich vegetarian gravies, curries & rice bowls', 'UtensilsCrossed'),
(4, 'Non-Veg Main Course', 'Gourmet chicken, mutton, seafood & steak specialties', 'Beef'),
(5, 'Artisanal Pizzas & Pasta', 'Handcrafted wood-fired pizzas and fresh pastas', 'Pizza'),
(6, 'Sweets & Desserts', 'Decadent sweets, warm cakes & artisanal gelatos', 'Cake'),
(7, 'Fresh Juices & Smoothies', '100% natural fruit juices, detox blends & smoothies', 'Coffee'),
(8, 'Cocktails & Mocktails', 'Crafted cocktails, spirits & refreshing mocktails', 'Sparkles');

-- 4. Food Items
INSERT INTO food_items (id, category_id, name, description, price, image_url, is_available, is_vegetarian, is_spicy, prep_time_minutes, rating_avg) VALUES
(1, 1, 'Charcoal Paneer Tikka', 'Juicy cottage cheese cubes marinated in spiced yogurt, smoked garlic, and clay-oven grilled with bell peppers', 179.00, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, TRUE, 15, 4.85),
(2, 1, 'Truffle Mushroom Bruschetta', 'Crispy sourdough topped with sautéed wild mushrooms, truffle oil, and parmesan shavings', 169.00, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 12, 4.80),
(3, 1, 'Crispy Veg Spring Rolls', 'Golden fried rolls stuffed with crunchy glass noodles, mushrooms, and Asian veggies with sweet chili dip', 129.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 10, 4.65),
(4, 1, 'Honey Chili Crispy Cauliflower', 'Battered crispy cauliflower florets tossed in sweet honey chili garlic glaze with sesame seeds', 149.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, TRUE, 12, 4.75),
(5, 1, 'Hara Bhara Kebab', 'Spinach, green peas, and cottage cheese patties flavored with royal spices & mint chutney', 139.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 12, 4.70),
(6, 1, 'Crispy Chili Garlic Corn', 'Tender sweet corn tossed with bell peppers, spring onions, and roasted garlic chili seasoning', 119.00, 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, TRUE, 10, 4.68),
(7, 2, 'Crispy Calamari Rings', 'Golden fried squid served with homemade spicy garlic aioli and fresh lemon wedges', 219.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, TRUE, 15, 4.70),
(8, 2, 'Fiery Buffalo Chicken Wings', 'Juicy fried wings tossed in fiery cayenne buffalo sauce served with blue cheese dip and celery', 189.00, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, TRUE, 15, 4.80),
(9, 2, 'Tandoori Murgh Tikka', 'Boneless chicken chunks marinated in aromatic Indian spices and clay-oven grilled to perfection', 199.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, TRUE, 18, 4.90),
(10, 2, 'Butterfly Golden Prawns', 'Jumbo prawns coated in crunchy Japanese panko crumbs served with zesty tartar dip', 249.00, 'https://images.unsplash.com/photo-1559742811-822863c46f83?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, FALSE, 15, 4.85),
(11, 2, 'Spiced Chicken Lollipop', 'Frenched chicken drumettes marinated in fiery ginger-garlic paste and deep fried golden', 189.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, TRUE, 15, 4.82),
(12, 2, 'Royal Mutton Seekh Kebab', 'Minced lamb mixed with aromatic spices, fresh herbs, and clay-oven grilled on skewers', 249.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, TRUE, 20, 4.88),
(13, 3, 'Royal Paneer Butter Masala', 'Rich cottage cheese cubes in silky tomato butter cream gravy infused with fragrant kasuri methi', 199.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 18, 4.90),
(14, 3, 'Slow-Cooked Dal Makhani', 'Black lentils simmered overnight with butter, cream, and slow-roasted aromatic herbs', 169.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 15, 4.95),
(15, 3, 'Wild Mushroom Risotto', 'Arborio rice cooked in rich vegetable broth with parmesan, wild mushrooms, and truffle oil glaze', 249.00, 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 20, 4.80),
(16, 3, 'Hyderabadi Veg Dum Biryani', 'Aromatic long-grain basmati rice layered with spiced garden vegetables, saffron, mint, and fried onions', 179.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, TRUE, 22, 4.75),
(17, 3, 'Creamy Shahi Malai Kofta', 'Delicate cottage cheese & dumpling balls simmered in rich cashew cream sauce', 199.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 18, 4.87),
(18, 3, 'Spicy Kadhai Paneer Special', 'Fresh paneer cubes cooked with crushed coriander seeds, capsicum, and roasted chili gravy', 189.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, TRUE, 16, 4.82),
(19, 4, 'Classic Murgh Butter Chicken', 'Tender tandoori chicken cooked in velvety tomato, butter, and cashew cream gravy', 249.00, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, FALSE, 20, 4.95),
(20, 4, 'Kashmiri Mutton Rogan Josh', 'Slow-braised tender lamb shanks in rich red chili, fennel, and aromatic Kashmiri gravy', 289.00, 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, TRUE, 25, 4.90),
(21, 4, 'Grilled Norwegian Salmon Steak', 'Pan-seared salmon served over garlic mashed potatoes and asparagus with lemon dill butter sauce', 349.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, FALSE, 20, 4.88),
(22, 4, 'Hyderabadi Chicken Dum Biryani', 'Fragrant basmati rice slow-cooked on dum with marinated tender chicken and rich spices', 239.00, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, TRUE, 25, 4.92),
(23, 4, 'Signature Prime Angus Steak', 'Grilled 250g Angus ribeye steak served with truffle fries, grilled veggies, and garlic herb butter', 349.00, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, FALSE, 22, 4.90),
(24, 4, 'Goan Coconut Prawn Curry', 'Tiger prawns simmered in aromatic coconut cream, kokum, and Goan spices', 279.00, 'https://images.unsplash.com/photo-1559742811-822863c46f83?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, TRUE, 20, 4.86),
(25, 5, 'Margherita Supreme Pizza', 'San Marzano tomato base, fresh buffalo mozzarella, fragrant basil, and extra virgin olive oil', 199.00, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 18, 4.90),
(26, 5, 'Spicy Pepperoni & Hot Honey Pizza', 'Crispy cupping pepperoni, aged mozzarella, chili flakes, drizzled with spicy wild honey', 299.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, TRUE, 20, 4.95),
(27, 5, 'Classic Fettuccine Alfredo', 'Handmade fettuccine ribbons in a rich Parmigiano-Reggiano cream sauce with toasted garlic', 219.00, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 15, 4.75),
(28, 5, 'Penne Arrabbiata Piccante', 'Penne pasta tossed in fiery garlic, San Marzano tomatoes, chili flakes, and fresh basil', 199.00, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, TRUE, 14, 4.78),
(29, 5, 'Smoky BBQ Chicken Pizza', 'Grilled chicken, red onions, smoked cheddar, coriander, and sweet BBQ sauce glaze', 329.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', TRUE, FALSE, FALSE, 20, 4.89),
(30, 6, 'Molten Chocolate Lava Cake', 'Warm Belgian chocolate cake with an oozing rich center served with Madagascar vanilla gelato', 149.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 12, 4.95),
(31, 6, 'Classic Italian Tiramisu', 'Savoiardi ladyfingers soaked in espresso and dark rum layered with mascarpone cream', 169.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 8, 4.90),
(32, 6, 'Royal Shahi Gulab Jamun with Kulfi', 'Warm cardamom milk dumplings in saffron sugar syrup served with rich pistachio kulfi', 89.00, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 6, 4.88),
(33, 6, 'Alphonso Mango Cheesecake', 'Creamy slow-baked New York cheesecake topped with fresh Alphonso mango compote glaze', 129.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.85),
(34, 6, 'Cardamom Saffron Rasmalai', 'Soft cottage cheese discs soaked in chilled saffron-infused cardamom milk with pistachios', 99.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.91),
(35, 6, 'Belgian Chocolate Brownie Sundae', 'Fudgy dark chocolate brownie topped with Madagascar vanilla ice cream and hot fudge', 139.00, 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 8, 4.87),
(36, 7, 'Fresh Watermelon Mint Cooler', '100% cold-pressed watermelon juice with fresh mint leaves and lime juice', 79.00, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.85),
(37, 7, 'Tropical Mango Passion Smoothie', 'Blended Alphonso mango, passionfruit, organic Greek yogurt, and wildflower honey', 109.00, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.90),
(38, 7, 'Green Goddess Detox Blend', 'Cold-pressed cucumber, green apple, celery, spinach, ginger, and fresh lemon', 89.00, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.75),
(39, 7, 'Fresh Squeezed Valencia Orange Juice', 'Pure cold-pressed Valencia oranges packed with natural vitamin C and sweet tangy flavor', 89.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.88),
(40, 7, 'Iced Salted Caramel Macchiato', 'Cold brewed espresso layered with salted caramel syrup and velvety oat milk', 79.00, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.85),
(41, 8, 'Passion Fruit Mint Spritzer', 'Fresh passion fruit puree, crushed mint, lime juice, and sparkling soda water', 99.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.80),
(42, 8, 'Smoked Bourbon Old Fashioned', 'Aged Kentucky bourbon whiskey, Angostura bitters, orange zest, infused with applewood smoke', 199.00, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 6, 4.92),
(43, 8, 'Classic Cuban Rum Mojito', 'White rum, fresh muddled lime, mint leaves, cane sugar, and a splash of sparkling soda', 169.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.88),
(44, 8, 'Velvety Espresso Martini', 'Freshly pulled espresso shot, premium vodka, Kahlúa coffee liqueur, garnished with roasted beans', 189.00, 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 6, 4.95),
(45, 8, 'Electric Blue Lagoon Mocktail', 'Refreshing blue curaçao, fresh lemon juice, mint, and sparkling soda', 99.00, 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.82),
(46, 8, 'Tropical Piña Colada', 'Creamy coconut cream, pineapple juice, and aged white rum served over crushed ice', 159.00, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=600&q=80', TRUE, TRUE, FALSE, 5, 4.89);

-- 5. Restaurant Tables
INSERT INTO restaurant_tables (id, table_number, capacity, location, status, qr_code_token) VALUES
(1, 'T-01', 2, 'Window Side', 'Available', 'QR-T01-7891'),
(2, 'T-02', 4, 'Main Dining Hall', 'Occupied', 'QR-T02-4512'),
(3, 'T-03', 4, 'Main Dining Hall', 'Available', 'QR-T03-9031'),
(4, 'T-04', 6, 'VIP Terrace', 'Reserved', 'QR-T04-3321'),
(5, 'T-05', 8, 'Private Dining Room', 'Available', 'QR-T05-1104');

-- 6. Offers & Coupons
INSERT INTO offers (id, code, title, description, discount_percent, fixed_discount, min_order_amount, valid_until, is_active) VALUES
(1, 'WELCOME15', '15% Off First Order', 'Enjoy 15% discount on your first dine-in or delivery order', 15.00, 0.00, 25.00, '2026-12-31 23:59:59', TRUE),
(2, 'TASTY20', '$20 Flat Discount', '$20 off on orders over $100', 0.00, 20.00, 100.00, '2026-12-31 23:59:59', TRUE),
(3, 'PIZZALOVE', '10% Off Pizzas & Drinks', 'Special discount on artisanal pizza combos', 10.00, 0.00, 30.00, '2026-12-31 23:59:59', TRUE);

-- 7. Reservations
INSERT INTO reservations (id, user_id, table_id, reservation_date, reservation_time, guest_count, special_requests, status) VALUES
(1, 4, 4, CURRENT_DATE, '19:30:00', 4, 'Anniversary dinner setup with candlelight', 'Confirmed'),
(2, 5, 1, CURRENT_DATE, '20:00:00', 2, 'Quiet table near window requested', 'Confirmed');

-- 8. Sample Orders
INSERT INTO orders (id, order_number, user_id, table_id, order_type, status, subtotal, discount_amount, tax_amount, total_amount, payment_status, payment_method, notes) VALUES
(1, 'ORD-20261001-001', 4, 2, 'Dine-In', 'Preparing', 40.49, 0.00, 3.24, 43.73, 'Paid', 'Card', 'Extra napkins requested'),
(2, 'ORD-20261001-002', 5, NULL, 'Delivery', 'Received', 28.49, 4.27, 2.28, 26.50, 'Pending', 'UPI', 'Leave at front door');

-- 9. Order Items
INSERT INTO order_items (id, order_id, food_item_id, quantity, unit_price, subtotal, special_instructions) VALUES
(1, 1, 3, 1, 18.99, 18.99, 'Well done crust'),
(2, 1, 4, 1, 21.50, 21.50, 'Extra spicy honey drizzle'),
(3, 2, 5, 1, 19.50, 19.50, 'Medium rare patty'),
(4, 2, 11, 1, 8.99, 8.99, 'With extra vanilla scoop');

-- 10. Reviews
INSERT INTO reviews (id, user_id, food_item_id, order_id, rating, comment) VALUES
(1, 4, 3, 1, 5, 'The Margherita Supreme was out of this world! Incredible authentic flavor.'),
(2, 5, 5, 2, 4, 'Juicy burger and crisp truffle fries. Delivery was quick too.');

-- 11. Ingredients
INSERT INTO ingredients (id, name, unit, current_stock, reorder_level, cost_per_unit) VALUES
(1, 'Mozzarella Cheese', 'kg', 25.50, 10.00, 8.50),
(2, 'San Marzano Tomato Sauce', 'liters', 40.00, 12.00, 4.20),
(3, 'Pizza Dough Flour', 'kg', 100.00, 25.00, 2.10),
(4, 'Pepperoni Slices', 'kg', 12.00, 4.00, 14.00),
(5, 'Angus Beef Patties', 'units', 45.00, 15.00, 5.50),
(6, 'Brioche Buns', 'units', 50.00, 20.00, 1.20),
(7, 'Wild Mushrooms', 'kg', 8.00, 3.00, 11.00),
(8, 'Truffle Oil', 'liters', 4.50, 1.00, 35.00),
(9, 'Heavy Cream', 'liters', 18.00, 5.00, 3.80),
(10, 'Fettuccine Pasta', 'kg', 30.00, 8.00, 2.90);

-- 12. Food-Ingredients Recipes Mapping
INSERT INTO food_ingredients (food_item_id, ingredient_id, quantity_required) VALUES
(1, 7, 0.15), -- Truffle Mushroom Bruschetta: 0.15kg mushrooms
(1, 8, 0.02), -- 0.02L Truffle oil
(3, 1, 0.20), -- Margherita: 0.20kg mozzarella
(3, 2, 0.15), -- 0.15L tomato sauce
(3, 3, 0.25), -- 0.25kg flour
(4, 1, 0.20), -- Spicy Pepperoni Pizza
(4, 2, 0.15),
(4, 3, 0.25),
(4, 4, 0.12), -- 0.12kg pepperoni
(5, 5, 1.00), -- 1 beef patty
(5, 6, 1.00), -- 1 bun
(7, 9, 0.15), -- 0.15L heavy cream
(7, 10, 0.20);-- 0.20kg fettuccine

-- 13. Suppliers
INSERT INTO suppliers (id, name, contact_person, phone, email, address) VALUES
(1, 'Roma Gourmet Dairy Co.', 'Gianni Bellini', '+1 (555) 882-1920', 'orders@romadairy.com', '142 Alpine Way, Industrial Zone'),
(2, 'Prime Select Meats', 'Dave Miller', '+1 (555) 771-9031', 'sales@primemeats.com', '88 Meatpackers Blvd, Logistics Hub'),
(3, 'Fresh Farm Produce Distributors', 'Clara Vance', '+1 (555) 443-8812', 'info@freshfarmpd.com', '99 Organic Drive, Valley View');

-- 14. Inventory Transactions
INSERT INTO inventory_transactions (ingredient_id, transaction_type, quantity, notes) VALUES
(1, 'IN', 30.00, 'Initial bulk shipment from Roma Gourmet Dairy'),
(3, 'IN', 100.00, 'Quarterly flour stock update'),
(5, 'IN', 60.00, 'Weekly Angus beef patty delivery'),
(1, 'OUT', 4.50, 'Deducted for orders #1 and #2');
