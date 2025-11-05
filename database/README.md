# Supabase Database Setup Guide

## Prerequisites
1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Setup Instructions

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details and wait for it to be created

### Step 2: Run SQL Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (users, products, orders, etc.)
- Indexes for performance
- Foreign key relationships
- Sample data (1 admin, 1 canteen user, 3 products)

### Step 3: Get API Credentials
1. Go to **Project Settings** > **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**

### Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Generate a JWT secret (or use the provided one for testing):
   ```bash
   openssl rand -base64 32
   ```

### Step 5: Install Dependencies
```bash
npm install @supabase/supabase-js bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Step 6: Verify Setup
Run these queries in Supabase SQL Editor to verify:

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Verify admin user (default password: admin123)
SELECT id, name, email, role FROM users WHERE role = 'admin';

-- Verify products
SELECT id, name, price, category FROM products;
```

## Default Credentials

### Admin User
- Email: `admin@example.com`
- Password: `admin123` (change this in production!)

### Canteen User
- Email: `canteen@example.com`
- Password: `canteen123` (change this in production!)

**IMPORTANT**: The password hashes in the schema are just placeholders. You should:
1. Either delete these sample users and create new ones via the API
2. Or update the password hashes with properly hashed passwords

## Database Tables

### Users
Stores all users (user, canteen, admin roles)

### Products
Food items available for order

### Cart Items
Temporary cart storage for users

### Orders
Order records with status tracking

### Order Items
Individual items in each order

### Wallet Transactions
History of all wallet credits/debits

### Coupons
Admin-created discount coupons

### User Coupons
Tracks which users received which coupons

### Notifications
User notifications for orders, wallet, coupons

## API Endpoints

### Public Routes
- `GET /api/products` - View all available products
- `GET /api/products/[id]` - View single product

### User Routes
- `POST /api/user/auth` - Signup/Login
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/cart` - Get cart items
- `POST /api/user/cart` - Add to cart
- `PUT /api/user/cart/[id]` - Update cart item
- `DELETE /api/user/cart/[id]` - Remove from cart
- `GET /api/user/orders` - Get user orders
- `POST /api/user/orders` - Create order
- `GET /api/user/orders/[id]` - Get order details
- `PUT /api/user/orders/[id]` - Cancel order
- `GET /api/user/wallet` - Get wallet balance & transactions
- `POST /api/user/wallet` - Top up wallet
- `POST /api/user/coupons/redeem` - Redeem coupon
- `GET /api/user/notifications` - Get notifications
- `PUT /api/user/notifications` - Mark all as read
- `PUT /api/user/notifications/[id]` - Mark one as read
- `DELETE /api/user/notifications/[id]` - Delete notification

### Canteen Routes
- `GET /api/canteen/orders` - Get all orders
- `PUT /api/canteen/orders/[id]` - Update order status
- `GET /api/canteen/products` - Get all products
- `POST /api/canteen/products` - Create product
- `PUT /api/canteen/products/[id]` - Update product
- `DELETE /api/canteen/products/[id]` - Delete product
- `GET /api/canteen/stats` - Get sales statistics

### Admin Routes
- `GET /api/admin/dashboard` - Get comprehensive stats
- `GET /api/admin/users` - Get users (with pagination)
- `POST /api/admin/users` - Create user/canteen
- `GET /api/admin/users/[id]` - Get user details
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/coupons` - Get all coupons
- `POST /api/admin/coupons` - Create coupon
- `PUT /api/admin/coupons/[id]` - Update coupon
- `DELETE /api/admin/coupons/[id]` - Delete coupon

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Get the token by calling `/api/user/auth` with action "login".

## Razorpay Integration

For payment integration (test mode):
1. Sign up at https://razorpay.com
2. Get test API keys from Dashboard
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and key are correct
- Check if your Supabase project is active
- Ensure you're using the correct API key (anon/public key)

### Authentication Errors
- Make sure JWT_SECRET is set in .env.local
- Verify the token is being sent correctly in headers

### Database Errors
- Check if all tables were created successfully
- Verify foreign key relationships
- Look at Supabase logs for detailed errors

## Security Notes

1. **Change default passwords** before deploying to production
2. **Use strong JWT secret** - generate with `openssl rand -base64 32`
3. **Enable Row Level Security (RLS)** in Supabase for production
4. **Validate Razorpay payments** on the server side in production
5. **Use HTTPS** in production
6. **Don't commit .env.local** to version control
