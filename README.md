# QuickBite

Why walk when you can tap? Flask + Next.js =Food at warp speed!  Admin-approved, student-tested, hunger-busted

## Description

This project combines a Flask backend API with a Next.js frontend to create a comprehensive campus food ordering system. It includes user authentication, canteen menu management, shopping cart functionality, and an admin dashboard.

## Live Demo

Check out the live version here: [QuickBite Live](https://quick-bite-lake.vercel.app/login)

Use
*For canteen:*
test@test.com
12345678


*For admin:*
admin@qb.com
admin@123


*For user:*
vardan@qb.com
12345678


![image](https://github.com/user-attachments/assets/8644eb6c-c45c-4724-83e6-0d1a0338c434)


<img width="1914" height="1080" alt="image" src="https://github.com/user-attachments/assets/ba9a05cf-0644-4b27-a209-3a3dc4d58304" />


<img width="1910" height="1080" alt="image" src="https://github.com/user-attachments/assets/bc930ae9-e56f-4ab0-b895-89edcfff774a" />




<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2f3dee30-bbfe-48d2-9db4-b31c402cca92" />



<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/88d063d9-c67c-4d62-84a4-416b43d4877c" />





<img width="1908" height="1080" alt="image" src="https://github.com/user-attachments/assets/eec412ad-9df3-4a21-b776-774b170da7b2" />


![image](https://github.com/user-attachments/assets/657448ad-3491-49c6-abb8-bf1b149f540b)


<img width="1912" height="1080" alt="image" src="https://github.com/user-attachments/assets/6aa274bb-a057-45ba-a3e4-ac5dd5fd49c2" />










## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Jwt
- **File Storage**: ImgBB

## Installation


### Prerequisites

- Node.js (v14 or later)
- Python (v3.8 or later)
- Firebase account with project set up

### Setup Backend

1. Create a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```sh
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   - Ensure your `.env` file is properly configured with Firebase credentials.
  ```sh
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here
FIREBASE_CREDENTIALS=firebase_credentials.json
```

### Setup Frontend

1. Install Node.js dependencies:
   ```sh
   npm install
   ```


### Running the Application

1. Start the Flask backend:
   ```sh
   python app.py
   ```

2. Start the Next.js development server:
   ```sh
   npm run dev
   ```

## Project Structure

```
.
├── .env                      # Environment variables
├── app.py                    # Flask backend application
├── components/               # React components
│   ├── admin/                # Admin-specific components
│   ├── auth/                 # Authentication components  
│   ├── layout/               # Layout components
│   └── ui/                   # UI components
├── firebase_credentials.json # Firebase configuration
├── jsconfig.json             # JavaScript configuration
├── middleware.ts             # Next.js middleware
├── next-env.d.ts             # Next.js TypeScript types
├── next.config.js            # Next.js configuration
├── package.json              # Node dependencies
├── pages/                    # Next.js pages
│   ├── _app.tsx              # App component
│   ├── _document.tsx         # Document component
│   ├── 404.tsx               # 404 error page
│   ├── 500.tsx               # 500 error page
│   ├── admin/                # Admin pages
│   ├── canteen/              # Canteen management pages
│   │   └── menu.tsx          # Canteen menu management
│   ├── cart.tsx              # Shopping cart page
│   ├── checkout.tsx          # Checkout page
│   └── dashboard.tsx         # Dashboard page
├── postcss.config.js         # PostCSS configuration
├── requirements.txt          # Python dependencies
├── reset_admin_pass.py       # Admin password reset script
├── styles/                   # CSS styles
│   └── globals.css           # Global styles
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── utils/                    # Utility functions
```

## Features

- **Role-Based Login**: Single-page authentication system for users, canteens, and admins
- **User page**: User can view and order items and track their wallet, can top-up using giftcards and any other payment methods 
- **Canteen page**: accept orders, add itens to menu, cancel & refund items, and has analytics of each item and a dashboard
- **Admin Dashboard**: User management, canteen administration, gift card generation and analytics
- **reset_admin_pass.py**: a script which resets admin password incase if they forgets, stored on server so that only admin can access



## API Endpoints

The backend provides various API endpoints including:

- `http://127.0.0.1:3000/login` - single login page for users, canteens, admin
- `http://127.0.0.1:3000/canteen/dashvoard` - Canteen dashboard
- `http://127.0.0.1:3000/admin/dashboard` - Admin dashboard
- `http://127.0.0.1:3000/dashboard` - User dashboard


## Note: 
this project was created as a part of Food4Code by SynapHack - 2025 Hackathon

