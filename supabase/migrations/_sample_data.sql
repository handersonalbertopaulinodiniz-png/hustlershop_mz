-- Sample Data for Testing

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
  ('Electronics', 'Electronic devices and accessories'),
  ('Clothing', 'Fashion and apparel'),
  ('Home & Garden', 'Home improvement and garden supplies'),
  ('Sports & Outdoors', 'Sports equipment and outdoor gear'),
  ('Books', 'Books and educational materials');

-- Insert sample products
INSERT INTO public.products (name, description, price, category_id, stock_quantity, sku) VALUES
  ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 
   (SELECT id FROM public.categories WHERE name = 'Electronics' LIMIT 1), 50, 'WH-001'),
  
  ('Smart Watch', 'Fitness tracking smart watch with heart rate monitor', 199.99,
   (SELECT id FROM public.categories WHERE name = 'Electronics' LIMIT 1), 30, 'SW-001'),
  
  ('Cotton T-Shirt', 'Comfortable cotton t-shirt available in multiple colors', 19.99,
   (SELECT id FROM public.categories WHERE name = 'Clothing' LIMIT 1), 100, 'TS-001'),
  
  ('Running Shoes', 'Professional running shoes with cushioned sole', 79.99,
   (SELECT id FROM public.categories WHERE name = 'Sports & Outdoors' LIMIT 1), 40, 'RS-001'),
  
  ('Coffee Maker', 'Automatic coffee maker with programmable timer', 49.99,
   (SELECT id FROM public.categories WHERE name = 'Home & Garden' LIMIT 1), 25, 'CM-001'),
  
  ('Yoga Mat', 'Non-slip yoga mat with carrying strap', 29.99,
   (SELECT id FROM public.categories WHERE name = 'Sports & Outdoors' LIMIT 1), 60, 'YM-001'),
  
  ('LED Desk Lamp', 'Adjustable LED desk lamp with USB charging port', 34.99,
   (SELECT id FROM public.categories WHERE name = 'Electronics' LIMIT 1), 45, 'DL-001'),
  
  ('Backpack', 'Durable backpack with laptop compartment', 59.99,
   (SELECT id FROM public.categories WHERE name = 'Sports & Outdoors' LIMIT 1), 35, 'BP-001');

-- Note: Admin user should be created through the authentication flow
-- Sample users would be created when they sign up through the app
