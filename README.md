# QuickBite

Why walk when you can tap? Flask + Next.js =Food at warp speed!  Admin-approved, student-tested, hunger-busted

## Description

This project combines a Flask backend API with a Next.js frontend to create a comprehensive campus food ordering system. It includes user authentication, canteen menu management, shopping cart functionality, and an admin dashboard.

## Live Demo

Check out the live version here: [QuickBite Live](http://qb-two.vercel.app/login)
![image](https://github.com/user-attachments/assets/49d4e260-805e-4305-8b6e-2da90fa89358)

![image](https://github.com/user-attachments/assets/7f48eb13-befb-43dd-bc29-c32d973190fa)

![image](https://github.com/user-attachments/assets/990dd00a-e958-450f-966e-10e6cde988f5)


![image](https://github.com/user-attachments/assets/bb809c69-a410-40e2-95af-1bab956ed849)

![image](https://github.com/user-attachments/assets/fb0331a2-1f65-415c-b2d2-85273044a93a)


![image](https://github.com/user-attachments/assets/9f87ecf1-3019-4a14-82fc-30e3705c9863)

![image](https://github.com/user-attachments/assets/91b33ea1-b5a9-4a8d-9bbf-a5b13185f522)

![image](https://github.com/user-attachments/assets/f8c4fa94-edb4-474b-a85b-eaaa0ee86a8f)







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

