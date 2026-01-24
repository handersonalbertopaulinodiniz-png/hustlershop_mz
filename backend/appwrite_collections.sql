-- HustlerShop MZ Appwrite Collections Schema
-- Execute these commands in Appwrite Console or via CLI

-- 1. Profiles Collection
appwrite databases createCollection \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --name "User Profiles" \
  --permission read "any" \
  --permission read "users" \
  --permission update "users" \
  --permission create "users" \
  --permission delete "users"

-- Add attributes to profiles collection
appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key user_id \
  --size 36 \
  --required true \
  --default ""

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key full_name \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key email \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key role \
  --size 20 \
  --required true \
  --default "customer" \
  --enum "admin,customer,delivery"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key approval_status \
  --size 20 \
  --required true \
  --default "pending" \
  --enum "pending,approved,rejected"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key phone \
  --size 20 \
  --required false

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key address \
  --size 500 \
  --required false

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key bi_number \
  --size 20 \
  --required false

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key transport_type \
  --size 20 \
  --required false \
  --enum "mota,carro,bicicleta,a_pe"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key bio \
  --size 1000 \
  --required false

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key avatar_url \
  --size 500 \
  --required false

appwrite databases createDatetimeAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key created_at \
  --required true \
  --default ""

appwrite databases createDatetimeAttribute \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key updated_at \
  --required true \
  --default ""

-- 2. Categories Collection
appwrite databases createCollection \
  --databaseId hustlershop-db \
  --collectionId categories \
  --name "Product Categories" \
  --permission read "any" \
  --permission read "users" \
  --permission write "users" \
  --permission create "users" \
  --permission delete "users"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId categories \
  --key name \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId categories \
  --key slug \
  --size 255 \
  --required false

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId categories \
  --key description \
  --size 500 \
  --required false

appwrite databases createDatetimeAttribute \
  --databaseId hustlershop-db \
  --collectionId categories \
  --key created_at \
  --required true \
  --default ""

-- 3. Products Collection
appwrite databases createCollection \
  --databaseId hustlershop-db \
  --collectionId products \
  --name "Products" \
  --permission read "any" \
  --permission read "users" \
  --permission write "users" \
  --permission create "users" \
  --permission delete "users"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId products \
  --key name \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId products \
  --key description \
  --size 2000 \
  --required false

appwrite databases createFloatAttribute \
  --databaseId hustlershop-db \
  --collectionId products \
  --key price \
  --required true \
  --min 0 \
  --max 99999999.99 \
  --default 0

appwrite databases createIntegerAttribute \
  --databaseId hustlershop-db \
  --collectionId products \
  --key stock_quantity \
  --required true \
  --min 0 \
  --max 999999 \
  --default 0

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId products \
  --key category_id \
  --size 36 \
  --required false

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId products \
  --key image_url \
  --size 500 \
  --required false

appwrite databases createBooleanAttribute \
  --databaseId hustlershop-db \
  --collectionId products \
  --key is_active \
  --required true \
  --default true

appwrite databases createDatetimeAttribute \
  --databaseId hustlershop-db \
  --collectionId products \
  --key created_at \
  --required true \
  --default ""

appwrite databases createDatetimeAttribute \
  --databaseId hustlershop-db \
  --collectionId products \
  --key updated_at \
  --required true \
  --default ""

-- 4. Orders Collection
appwrite databases createCollection \
  --databaseId hustlershop-db \
  --collectionId orders \
  --name "Orders" \
  --permission read "users" \
  --permission write "users" \
  --permission create "users" \
  --permission delete "users"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key user_id \
  --size 36 \
  --required true

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key delivery_id \
  --size 36 \
  --required false

appwrite databases createFloatAttribute \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key total_amount \
  --required true \
  --min 0 \
  --max 99999999.99

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key status \
  --size 20 \
  --required true \
  --default "pending" \
  --enum "pending,processing,shipped,delivered,cancelled"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key payment_status \
  --size 20 \
  --required true \
  --default "pending" \
  --enum "pending,completed,failed,refunded"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key payment_method \
  --size 50 \
  --required false

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key shipping_address \
  --size 500 \
  --required false

appwrite databases createDatetimeAttribute \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key created_at \
  --required true \
  --default ""

appwrite databases createDatetimeAttribute \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key updated_at \
  --required true \
  --default ""

-- 5. Order Items Collection
appwrite databases createCollection \
  --databaseId hustlershop-db \
  --collectionId order_items \
  --name "Order Items" \
  --permission read "users" \
  --permission write "users" \
  --permission create "users" \
  --permission delete "users"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId order_items \
  --key order_id \
  --size 36 \
  --required true

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId order_items \
  --key product_id \
  --size 36 \
  --required true

appwrite databases createIntegerAttribute \
  --databaseId hustlershop-db \
  --collectionId order_items \
  --key quantity \
  --required true \
  --min 1 \
  --max 999999

appwrite databases createFloatAttribute \
  --databaseId hustlershop-db \
  --collectionId order_items \
  --key unit_price \
  --required true \
  --min 0 \
  --max 99999999.99

-- 6. Cart Collection
appwrite databases createCollection \
  --databaseId hustlershop-db \
  --collectionId cart \
  --name "Shopping Cart" \
  --permission read "users" \
  --permission write "users" \
  --permission create "users" \
  --permission delete "users"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId cart \
  --key user_id \
  --size 36 \
  --required true

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId cart \
  --key product_id \
  --size 36 \
  --required true

appwrite databases createIntegerAttribute \
  --databaseId hustlershop-db \
  --collectionId cart \
  --key quantity \
  --required true \
  --min 1 \
  --max 999999 \
  --default 1

appwrite databases createDatetimeAttribute \
  --databaseId hustlershop-db \
  --collectionId cart \
  --key created_at \
  --required true \
  --default ""

-- 7. Wishlist Collection
appwrite databases createCollection \
  --databaseId hustlershop-db \
  --collectionId wishlist \
  --name "Wishlist" \
  --permission read "users" \
  --permission write "users" \
  --permission create "users" \
  --permission delete "users"

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId wishlist \
  --key user_id \
  --size 36 \
  --required true

appwrite databases createStringAttribute \
  --databaseId hustlershop-db \
  --collectionId wishlist \
  --key product_id \
  --size 36 \
  --required true

appwrite databases createDatetimeAttribute \
  --databaseId hustlershop-db \
  --collectionId wishlist \
  --key created_at \
  --required true \
  --default ""

-- Create indexes for better performance
appwrite databases createIndex \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key email \
  --type unique

appwrite databases createIndex \
  --databaseId hustlershop-db \
  --collectionId profiles \
  --key user_id \
  --type unique

appwrite databases createIndex \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key user_id \
  --type key

appwrite databases createIndex \
  --databaseId hustlershop-db \
  --collectionId orders \
  --key delivery_id \
  --type key

appwrite databases createIndex \
  --databaseId hustlershop-db \
  --collectionId cart \
  --key user_id \
  --type key

appwrite databases createIndex \
  --databaseId hustlershop-db \
  --collectionId wishlist \
  --key user_id \
  --type key
