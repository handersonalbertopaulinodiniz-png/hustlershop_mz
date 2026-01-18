# HustlerShop 🛍️

A modern, full-featured e-commerce platform built with vanilla JavaScript and Supabase.

## ✨ Features

### For Customers
- 🛒 Browse and search products
- 🛍️ Shopping cart management
- ❤️ Wishlist functionality
- 📦 Order tracking
- 👤 Profile management
- 💳 Secure checkout

### For Admins
- 📊 Dashboard with analytics
- 📦 Product inventory management
- 👥 User management
- ✅ Approval queue for delivery personnel
- 📈 Order management

### For Delivery Personnel
- 🚚 Active delivery tracking
- 📍 Order pickup and delivery management
- 📜 Delivery history
- 👤 Profile management

## 🏗️ Architecture

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks, pure ES6+ modules
- **Modular Design** - Component-based architecture

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage

## 📁 Project Structure

```
hustlershop/
├── admin/              # Admin panel pages
├── assets/
│   ├── css/           # Stylesheets
│   │   ├── variables.css
│   │   ├── reset.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   ├── dark-theme.css
│   │   └── main.css
│   ├── images/        # Images and logos
│   └── js/
│       ├── components/ # Reusable UI components
│       ├── core/      # Core functionality
│       └── modules/   # Feature modules
├── auth/              # Authentication pages
├── customer/          # Customer pages
├── delivery/          # Delivery personnel pages
├── pages/error/       # Error pages
├── supabase/          # Database migrations
└── support/           # Support pages
```

## 🚀 Getting Started

### Prerequisites
- A Supabase account ([supabase.com](https://supabase.com))
- A web server (e.g., Live Server for VS Code)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hustlershop.git
   cd hustlershop
   ```

2. **Set up Supabase**
   - Create a new project on Supabase
   - Run the SQL migrations in order:
     1. `_initial_schema.sql`
     2. `_rls_policies.sql`
     3. `_functions_triggers.sql`
     4. `_sample_data.sql` (optional, for testing)

3. **Configure the application**
   - Open `assets/js/core/supabase.js`
   - Replace the placeholders with your Supabase credentials:
     ```javascript
     const SUPABASE_URL = 'your-project-url';
     const SUPABASE_ANON_KEY = 'your-anon-key';
     ```

4. **Create storage buckets**
   In Supabase dashboard, create these storage buckets:
   - `products` (for product images)
   - `avatars` (for user avatars)
   - `documents` (for documents)

5. **Run the application**
   - Use a local web server (e.g., Live Server)
   - Open `auth/login.html` to start

### First Admin User

To create the first admin user:
1. Sign up through the app with role "customer"
2. In Supabase, manually update the user's role to "admin":
   ```sql
   UPDATE public.users 
   SET role = 'admin', approval_status = 'approved'
   WHERE email = 'your-email@example.com';
   ```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#4F46E5 to #6366F1)
- **Accent**: Purple gradient (#9333EA to #A855F7)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Sizes**: Responsive scale from 0.75rem to 3rem

### Dark Mode
Full dark mode support with automatic theme detection and manual toggle.

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (RBAC)
- Secure authentication with Supabase Auth
- Protected API routes
- Input validation and sanitization

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email handersonalbertopaulinodiniz@gmail.com or join our Discord server.

## 🙏 Acknowledgments

- Supabase for the amazing backend platform
- Google Fonts for Inter typeface
- The open-source community

---

Built with ❤️ by the HustlerShop Team
