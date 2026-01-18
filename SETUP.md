# HustlerShop - Setup Guide

## 📋 Quick Start Guide

### 1. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `hustlershop`
   - Database password: (save this securely)
   - Region: (choose closest to you)

#### Run Database Migrations
1. In Supabase Dashboard, go to **SQL Editor**
2. Run the migrations in this order:
   - Copy and paste `supabase/migrations/_initial_schema.sql` → Click "Run"
   - Copy and paste `supabase/migrations/_rls_policies.sql` → Click "Run"
   - Copy and paste `supabase/migrations/_functions_triggers.sql` → Click "Run"
   - (Optional) Copy and paste `supabase/migrations/_sample_data.sql` → Click "Run"

#### Create Storage Buckets
1. Go to **Storage** in Supabase Dashboard
2. Create these buckets (make them public):
   - `products`
   - `avatars`
   - `documents`

#### Get Your API Keys
1. Go to **Settings** → **API**
2. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key

### 2. Configure the Application

1. Open `assets/js/core/supabase.js`
2. Replace the placeholders:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 3. Run the Application

#### Option A: Using Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

#### Option B: Using Python
```bash
cd hustlershop
python -m http.server 8000
```
Then open `http://localhost:8000`

#### Option C: Using Node.js
```bash
npx http-server hustlershop -p 8000
```
Then open `http://localhost:8000`

### 4. Create First Admin User

1. Sign up through the app at `/auth/signup.html`
2. Use any email and password
3. Select role: "Customer" (we'll change this)
4. Go to Supabase Dashboard → **Table Editor** → `users`
5. Find your user and click edit
6. Change:
   - `role` to `admin`
   - `approval_status` to `approved`
7. Save changes
8. Log out and log back in

### 5. Test the Application

#### As Customer:
1. Sign up with role "Customer"
2. Browse products
3. Add items to cart
4. Place an order

#### As Delivery Person:
1. Sign up with role "Delivery Person"
2. Wait for admin approval (or approve manually in database)
3. View assigned deliveries
4. Update delivery status

#### As Admin:
1. Log in with admin account
2. View dashboard statistics
3. Manage products
4. Approve delivery personnel
5. View all orders

## 🔧 Configuration Options

### Email Authentication
To enable email confirmations:
1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. Enable "Confirm email"
3. Configure email templates

### Custom Domain
To use a custom domain:
1. Update `site_url` in Supabase Auth settings
2. Add your domain to `additional_redirect_urls`

### Environment Variables
For production, consider using environment variables:
```javascript
const SUPABASE_URL = process.env.SUPABASE_URL || 'fallback-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'fallback-key';
```

## 🐛 Troubleshooting

### "Failed to connect to Supabase"
- Check if your API keys are correct
- Verify your Supabase project is active
- Check browser console for detailed errors

### "Row Level Security policy violation"
- Make sure RLS policies are applied
- Check if user has correct role
- Verify user is authenticated

### "Products not loading"
- Run the sample data migration
- Check if products table has data
- Verify RLS policies allow reading products

### "Can't sign up"
- Check Supabase Auth settings
- Verify email confirmations are configured
- Check browser console for errors

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

## 🆘 Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify all migrations ran successfully
4. Check that storage buckets are created and public

## 🚀 Deployment

### Deploy to Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Set build command: (none needed)
4. Set publish directory: `hustlershop`
5. Add environment variables if needed

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Set root directory: `hustlershop`
4. Deploy

### Deploy to GitHub Pages
1. Push code to GitHub
2. Go to Settings → Pages
3. Select branch and `/hustlershop` folder
4. Save

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] API keys configured
- [ ] Application running locally
- [ ] First admin user created
- [ ] Sample data loaded (optional)
- [ ] Email authentication configured (optional)
- [ ] Ready for production deployment

---

**Need more help?** Check the main README.md or create an issue on GitHub.
