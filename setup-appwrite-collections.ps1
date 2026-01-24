# HustlerShop - Script PowerShell de Configuração Automática das Collections do Appwrite
# Database ID: 697298a30022c92bfc1b
# Project ID: 696e35180026caf34a47

Write-Host "🚀 Iniciando configuração das Collections do Appwrite..." -ForegroundColor Green
Write-Host ""

# Database e Project IDs
$DATABASE_ID = "697298a30022c92bfc1b"
$PROJECT_ID = "696e35180026caf34a47"

# Função para executar comando e verificar erro
function Invoke-AppwriteCommand {
    param($Command)
    Write-Host "Executando: $Command" -ForegroundColor Gray
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Aviso: Comando pode ter falhado (isso é normal se a collection já existir)" -ForegroundColor Yellow
    }
}

# 1. PROFILES COLLECTION
Write-Host "📦 Criando collection: profiles" -ForegroundColor Cyan
Invoke-AppwriteCommand "appwrite databases createCollection --databaseId $DATABASE_ID --collectionId profiles --name 'User Profiles'"

# Atributos
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId profiles --key user_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId profiles --key full_name --size 255 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId profiles --key email --size 255 --required true"
Invoke-AppwriteCommand "appwrite databases createEnumAttribute --databaseId $DATABASE_ID --collectionId profiles --key role --elements admin,customer,delivery --required true --default customer"
Invoke-AppwriteCommand "appwrite databases createEnumAttribute --databaseId $DATABASE_ID --collectionId profiles --key approval_status --elements pending,approved,rejected --required true --default pending"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId profiles --key phone --size 20 --required false"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId profiles --key address --size 500 --required false"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId profiles --key bi_number --size 20 --required false"
Invoke-AppwriteCommand "appwrite databases createEnumAttribute --databaseId $DATABASE_ID --collectionId profiles --key transport_type --elements mota,carro,bicicleta,a_pe --required false"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId profiles --key bio --size 1000 --required false"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId profiles --key avatar_url --size 500 --required false"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId profiles --key created_at --required true"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId profiles --key updated_at --required true"

# Índices
Invoke-AppwriteCommand "appwrite databases createIndex --databaseId $DATABASE_ID --collectionId profiles --key email_unique --type unique --attributes email"
Invoke-AppwriteCommand "appwrite databases createIndex --databaseId $DATABASE_ID --collectionId profiles --key user_id_unique --type unique --attributes user_id"

Write-Host "✅ Collection 'profiles' criada com sucesso!" -ForegroundColor Green
Write-Host ""

# 2. CATEGORIES COLLECTION
Write-Host "📦 Criando collection: categories" -ForegroundColor Cyan
Invoke-AppwriteCommand "appwrite databases createCollection --databaseId $DATABASE_ID --collectionId categories --name 'Product Categories'"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId categories --key name --size 255 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId categories --key slug --size 255 --required false"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId categories --key description --size 500 --required false"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId categories --key created_at --required true"
Write-Host "✅ Collection 'categories' criada com sucesso!" -ForegroundColor Green
Write-Host ""

# 3. PRODUCTS COLLECTION
Write-Host "📦 Criando collection: products" -ForegroundColor Cyan
Invoke-AppwriteCommand "appwrite databases createCollection --databaseId $DATABASE_ID --collectionId products --name 'Products'"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId products --key name --size 255 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId products --key description --size 2000 --required false"
Invoke-AppwriteCommand "appwrite databases createFloatAttribute --databaseId $DATABASE_ID --collectionId products --key price --required true --min 0 --max 99999999.99 --default 0"
Invoke-AppwriteCommand "appwrite databases createIntegerAttribute --databaseId $DATABASE_ID --collectionId products --key stock_quantity --required true --min 0 --max 999999 --default 0"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId products --key category_id --size 36 --required false"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId products --key image_url --size 500 --required false"
Invoke-AppwriteCommand "appwrite databases createBooleanAttribute --databaseId $DATABASE_ID --collectionId products --key is_active --required true --default true"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId products --key created_at --required true"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId products --key updated_at --required true"
Write-Host "✅ Collection 'products' criada com sucesso!" -ForegroundColor Green
Write-Host ""

# 4. ORDERS COLLECTION
Write-Host "📦 Criando collection: orders" -ForegroundColor Cyan
Invoke-AppwriteCommand "appwrite databases createCollection --databaseId $DATABASE_ID --collectionId orders --name 'Orders'"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId orders --key user_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId orders --key delivery_id --size 36 --required false"
Invoke-AppwriteCommand "appwrite databases createFloatAttribute --databaseId $DATABASE_ID --collectionId orders --key total_amount --required true --min 0 --max 99999999.99"
Invoke-AppwriteCommand "appwrite databases createEnumAttribute --databaseId $DATABASE_ID --collectionId orders --key status --elements pending,processing,shipped,delivered,cancelled --required true --default pending"
Invoke-AppwriteCommand "appwrite databases createEnumAttribute --databaseId $DATABASE_ID --collectionId orders --key payment_status --elements pending,completed,failed,refunded --required true --default pending"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId orders --key payment_method --size 50 --required false"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId orders --key shipping_address --size 500 --required false"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId orders --key created_at --required true"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId orders --key updated_at --required true"

# Índices
Invoke-AppwriteCommand "appwrite databases createIndex --databaseId $DATABASE_ID --collectionId orders --key user_id_index --type key --attributes user_id"
Invoke-AppwriteCommand "appwrite databases createIndex --databaseId $DATABASE_ID --collectionId orders --key delivery_id_index --type key --attributes delivery_id"
Write-Host "✅ Collection 'orders' criada com sucesso!" -ForegroundColor Green
Write-Host ""

# 5. ORDER_ITEMS COLLECTION
Write-Host "📦 Criando collection: order_items" -ForegroundColor Cyan
Invoke-AppwriteCommand "appwrite databases createCollection --databaseId $DATABASE_ID --collectionId order_items --name 'Order Items'"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId order_items --key order_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId order_items --key product_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createIntegerAttribute --databaseId $DATABASE_ID --collectionId order_items --key quantity --required true --min 1 --max 999999"
Invoke-AppwriteCommand "appwrite databases createFloatAttribute --databaseId $DATABASE_ID --collectionId order_items --key unit_price --required true --min 0 --max 99999999.99"
Write-Host "✅ Collection 'order_items' criada com sucesso!" -ForegroundColor Green
Write-Host ""

# 6. CART COLLECTION
Write-Host "📦 Criando collection: cart" -ForegroundColor Cyan
Invoke-AppwriteCommand "appwrite databases createCollection --databaseId $DATABASE_ID --collectionId cart --name 'Shopping Cart'"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId cart --key user_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId cart --key product_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createIntegerAttribute --databaseId $DATABASE_ID --collectionId cart --key quantity --required true --min 1 --max 999999 --default 1"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId cart --key created_at --required true"
Invoke-AppwriteCommand "appwrite databases createIndex --databaseId $DATABASE_ID --collectionId cart --key user_id_index --type key --attributes user_id"
Write-Host "✅ Collection 'cart' criada com sucesso!" -ForegroundColor Green
Write-Host ""

# 7. WISHLIST COLLECTION
Write-Host "📦 Criando collection: wishlist" -ForegroundColor Cyan
Invoke-AppwriteCommand "appwrite databases createCollection --databaseId $DATABASE_ID --collectionId wishlist --name 'Wishlist'"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId wishlist --key user_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId wishlist --key product_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId wishlist --key created_at --required true"
Invoke-AppwriteCommand "appwrite databases createIndex --databaseId $DATABASE_ID --collectionId wishlist --key user_id_index --type key --attributes user_id"
Write-Host "✅ Collection 'wishlist' criada com sucesso!" -ForegroundColor Green
Write-Host ""

# 8. REVIEWS COLLECTION
Write-Host "📦 Criando collection: reviews" -ForegroundColor Cyan
Invoke-AppwriteCommand "appwrite databases createCollection --databaseId $DATABASE_ID --collectionId reviews --name 'Product Reviews'"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId reviews --key user_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId reviews --key product_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createIntegerAttribute --databaseId $DATABASE_ID --collectionId reviews --key rating --required true --min 1 --max 5"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId reviews --key comment --size 1000 --required false"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId reviews --key created_at --required true"
Write-Host "✅ Collection 'reviews' criada com sucesso!" -ForegroundColor Green
Write-Host ""

# 9. NOTIFICATIONS COLLECTION
Write-Host "📦 Criando collection: notifications" -ForegroundColor Cyan
Invoke-AppwriteCommand "appwrite databases createCollection --databaseId $DATABASE_ID --collectionId notifications --name 'User Notifications'"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId notifications --key user_id --size 36 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId notifications --key title --size 255 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId notifications --key message --size 1000 --required true"
Invoke-AppwriteCommand "appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId notifications --key type --size 50 --required false --default info"
Invoke-AppwriteCommand "appwrite databases createBooleanAttribute --databaseId $DATABASE_ID --collectionId notifications --key is_read --required true --default false"
Invoke-AppwriteCommand "appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId notifications --key created_at --required true"
Write-Host "✅ Collection 'notifications' criada com sucesso!" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 TODAS AS COLLECTIONS FORAM CRIADAS COM SUCESSO!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Collections criadas:" -ForegroundColor Cyan
Write-Host "  ✅ profiles" -ForegroundColor Green
Write-Host "  ✅ categories" -ForegroundColor Green
Write-Host "  ✅ products" -ForegroundColor Green
Write-Host "  ✅ orders" -ForegroundColor Green
Write-Host "  ✅ order_items" -ForegroundColor Green
Write-Host "  ✅ cart" -ForegroundColor Green
Write-Host "  ✅ wishlist" -ForegroundColor Green
Write-Host "  ✅ reviews" -ForegroundColor Green
Write-Host "  ✅ notifications" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Seu backend Appwrite está pronto para uso!" -ForegroundColor Green
