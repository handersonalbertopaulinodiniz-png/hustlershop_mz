#!/bin/bash
# HustlerShop - Script de Configuração Automática das Collections do Appwrite
# Database ID: 697298a30022c92bfc1b
# Project ID: 696e35180026caf34a47

echo "🚀 Iniciando configuração das Collections do Appwrite..."
echo ""

# Database e Project IDs
DATABASE_ID="697298a30022c92bfc1b"
PROJECT_ID="696e35180026caf34a47"

# 1. PROFILES COLLECTION
echo "📦 Criando collection: profiles"
appwrite databases createCollection \
  --databaseId "$DATABASE_ID" \
  --collectionId "profiles" \
  --name "User Profiles"

# Atributos da collection profiles
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key user_id --size 36 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key full_name --size 255 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key email --size 255 --required true
appwrite databases createEnumAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key role --elements "admin,customer,delivery" --required true --default "customer"
appwrite databases createEnumAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key approval_status --elements "pending,approved,rejected" --required true --default "pending"
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key phone --size 20 --required false
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key address --size 500 --required false
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key bi_number --size 20 --required false
appwrite databases createEnumAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key transport_type --elements "mota,carro,bicicleta,a_pe" --required false
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key bio --size 1000 --required false
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key avatar_url --size 500 --required false
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key created_at --required true
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId profiles --key updated_at --required true

# Índices
appwrite databases createIndex --databaseId "$DATABASE_ID" --collectionId profiles --key email_unique --type unique --attributes email
appwrite databases createIndex --databaseId "$DATABASE_ID" --collectionId profiles --key user_id_unique --type unique --attributes user_id

echo "✅ Collection 'profiles' criada com sucesso!"
echo ""

# 2. CATEGORIES COLLECTION
echo "📦 Criando collection: categories"
appwrite databases createCollection \
  --databaseId "$DATABASE_ID" \
  --collectionId "categories" \
  --name "Product Categories"

appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId categories --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId categories --key slug --size 255 --required false
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId categories --key description --size 500 --required false
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId categories --key created_at --required true

echo "✅ Collection 'categories' criada com sucesso!"
echo ""

# 3. PRODUCTS COLLECTION
echo "📦 Criando collection: products"
appwrite databases createCollection \
  --databaseId "$DATABASE_ID" \
  --collectionId "products" \
  --name "Products"

appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId products --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId products --key description --size 2000 --required false
appwrite databases createFloatAttribute --databaseId "$DATABASE_ID" --collectionId products --key price --required true --min 0 --max 99999999.99 --default 0
appwrite databases createIntegerAttribute --databaseId "$DATABASE_ID" --collectionId products --key stock_quantity --required true --min 0 --max 999999 --default 0
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId products --key category_id --size 36 --required false
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId products --key image_url --size 500 --required false
appwrite databases createBooleanAttribute --databaseId "$DATABASE_ID" --collectionId products --key is_active --required true --default true
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId products --key created_at --required true
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId products --key updated_at --required true

echo "✅ Collection 'products' criada com sucesso!"
echo ""

# 4. ORDERS COLLECTION
echo "📦 Criando collection: orders"
appwrite databases createCollection \
  --databaseId "$DATABASE_ID" \
  --collectionId "orders" \
  --name "Orders"

appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId orders --key user_id --size 36 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId orders --key delivery_id --size 36 --required false
appwrite databases createFloatAttribute --databaseId "$DATABASE_ID" --collectionId orders --key total_amount --required true --min 0 --max 99999999.99
appwrite databases createEnumAttribute --databaseId "$DATABASE_ID" --collectionId orders --key status --elements "pending,processing,shipped,delivered,cancelled" --required true --default "pending"
appwrite databases createEnumAttribute --databaseId "$DATABASE_ID" --collectionId orders --key payment_status --elements "pending,completed,failed,refunded" --required true --default "pending"
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId orders --key payment_method --size 50 --required false
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId orders --key shipping_address --size 500 --required false
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId orders --key created_at --required true
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId orders --key updated_at --required true

# Índices
appwrite databases createIndex --databaseId "$DATABASE_ID" --collectionId orders --key user_id_index --type key --attributes user_id
appwrite databases createIndex --databaseId "$DATABASE_ID" --collectionId orders --key delivery_id_index --type key --attributes delivery_id

echo "✅ Collection 'orders' criada com sucesso!"
echo ""

# 5. ORDER_ITEMS COLLECTION
echo "📦 Criando collection: order_items"
appwrite databases createCollection \
  --databaseId "$DATABASE_ID" \
  --collectionId "order_items" \
  --name "Order Items"

appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId order_items --key order_id --size 36 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId order_items --key product_id --size 36 --required true
appwrite databases createIntegerAttribute --databaseId "$DATABASE_ID" --collectionId order_items --key quantity --required true --min 1 --max 999999
appwrite databases createFloatAttribute --databaseId "$DATABASE_ID" --collectionId order_items --key unit_price --required true --min 0 --max 99999999.99

echo "✅ Collection 'order_items' criada com sucesso!"
echo ""

# 6. CART COLLECTION
echo "📦 Criando collection: cart"
appwrite databases createCollection \
  --databaseId "$DATABASE_ID" \
  --collectionId "cart" \
  --name "Shopping Cart"

appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId cart --key user_id --size 36 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId cart --key product_id --size 36 --required true
appwrite databases createIntegerAttribute --databaseId "$DATABASE_ID" --collectionId cart --key quantity --required true --min 1 --max 999999 --default 1
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId cart --key created_at --required true

# Índice
appwrite databases createIndex --databaseId "$DATABASE_ID" --collectionId cart --key user_id_index --type key --attributes user_id

echo "✅ Collection 'cart' criada com sucesso!"
echo ""

# 7. WISHLIST COLLECTION
echo "📦 Criando collection: wishlist"
appwrite databases createCollection \
  --databaseId "$DATABASE_ID" \
  --collectionId "wishlist" \
  --name "Wishlist"

appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId wishlist --key user_id --size 36 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId wishlist --key product_id --size 36 --required true
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId wishlist --key created_at --required true

# Índice
appwrite databases createIndex --databaseId "$DATABASE_ID" --collectionId wishlist --key user_id_index --type key --attributes user_id

echo "✅ Collection 'wishlist' criada com sucesso!"
echo ""

# 8. REVIEWS COLLECTION
echo "📦 Criando collection: reviews"
appwrite databases createCollection \
  --databaseId "$DATABASE_ID" \
  --collectionId "reviews" \
  --name "Product Reviews"

appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId reviews --key user_id --size 36 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId reviews --key product_id --size 36 --required true
appwrite databases createIntegerAttribute --databaseId "$DATABASE_ID" --collectionId reviews --key rating --required true --min 1 --max 5
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId reviews --key comment --size 1000 --required false
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId reviews --key created_at --required true

echo "✅ Collection 'reviews' criada com sucesso!"
echo ""

# 9. NOTIFICATIONS COLLECTION
echo "📦 Criando collection: notifications"
appwrite databases createCollection \
  --databaseId "$DATABASE_ID" \
  --collectionId "notifications" \
  --name "User Notifications"

appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId notifications --key user_id --size 36 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId notifications --key title --size 255 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId notifications --key message --size 1000 --required true
appwrite databases createStringAttribute --databaseId "$DATABASE_ID" --collectionId notifications --key type --size 50 --required false --default "info"
appwrite databases createBooleanAttribute --databaseId "$DATABASE_ID" --collectionId notifications --key is_read --required true --default false
appwrite databases createDatetimeAttribute --databaseId "$DATABASE_ID" --collectionId notifications --key created_at --required true

echo "✅ Collection 'notifications' criada com sucesso!"
echo ""

echo "🎉 TODAS AS COLLECTIONS FORAM CRIADAS COM SUCESSO!"
echo ""
echo "📋 Collections criadas:"
echo "  ✅ profiles"
echo "  ✅ categories"
echo "  ✅ products"
echo "  ✅ orders"
echo "  ✅ order_items"
echo "  ✅ cart"
echo "  ✅ wishlist"
echo "  ✅ reviews"
echo "  ✅ notifications"
echo ""
echo "🚀 Seu backend Appwrite está pronto para uso!"
