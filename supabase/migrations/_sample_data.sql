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
  ('Auscultadores Sem Fio', 'Auscultadores com cancelamento de ruído premium', 3500.00, 
   (SELECT id FROM public.categories WHERE name = 'Electronics' LIMIT 1), 50, 'WH-001'),
  
  ('Relógio Inteligente Pro', 'Monitor de fitness, batimentos cardíacos e GPS', 7500.00,
   (SELECT id FROM public.categories WHERE name = 'Electronics' LIMIT 1), 30, 'SW-001'),
  
  ('T-Shirt de Algodão', 'Confortável e resistente, 100% algodão', 850.00,
   (SELECT id FROM public.categories WHERE name = 'Clothing' LIMIT 1), 100, 'TS-001'),
  
  ('Sapatilhas de Corrida', 'Design ergonómico para alta performance', 4500.00,
   (SELECT id FROM public.categories WHERE name = 'Sports & Outdoors' LIMIT 1), 40, 'RS-001'),
  
  ('Máquina de Café Espresso', 'Café fresco todas as manhãs com um clique', 5200.00,
   (SELECT id FROM public.categories WHERE name = 'Home & Garden' LIMIT 1), 25, 'CM-001'),
  
  ('Tapete de Yoga', 'Anti-derrapante e extra grosso para conforto', 1200.00,
   (SELECT id FROM public.categories WHERE name = 'Sports & Outdoors' LIMIT 1), 60, 'YM-001'),
  
  ('Lâmpada LED de Mesa', 'Três níveis de brilho e carregamento USB', 1500.00,
   (SELECT id FROM public.categories WHERE name = 'Electronics' LIMIT 1), 45, 'DL-001'),
  
  ('Mochila Executiva', 'Compartimento para laptop e material impermeável', 2800.00,
   (SELECT id FROM public.categories WHERE name = 'Sports & Outdoors' LIMIT 1), 35, 'BP-001');

-- Note: Admin user should be created through the authentication flow
-- Sample users would be created when they sign up through the app
