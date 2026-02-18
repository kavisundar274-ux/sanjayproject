# Electrical Shop Billing System

A full MERN stack application for managing an electrical shop's products and billing.

## Features

- Product management (add, edit, delete products)
- Billing system with total calculations
- Modern, responsive UI
- RESTful API backend

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)

## Project Structure

```
electrical-shop/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   ├── .env
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd electrical-shop
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend/:

```env
PORT=5000
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/electrical-shop?retryWrites=true&w=majority
```

Run the backend:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in frontend/:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Add a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to Vercel.com and sign up/login
3. Click "New Project" and import your GitHub repo
4. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.vercel.app/api`
6. Deploy

### Backend Deployment (Vercel)

1. In Vercel, create a new project for the backend folder
2. Set build settings:
   - Build Command: `npm run build` (if needed)
   - Install Command: `npm install`
3. Add environment variables from `.env`
4. Deploy

### Alternative: Deploy Backend to Heroku

1. Create a Heroku account
2. Install Heroku CLI
3. In backend folder:

```bash
heroku create your-app-name
heroku config:set MONGO_URI=your-mongo-uri
heroku config:set PORT=5000
git push heroku main
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License
```

### 2. Frontend

```bash
cd shri-ganesh-frontend
npm install
```

Create `shri-ganesh-frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com  # For Google Sign-In
```

Run frontend:

```bash
npm run dev
```

### 3. Google Sign-In (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project, enable Google+ API
3. Create OAuth 2.0 credentials (Web application)
4. Add `http://localhost:5173` to authorized origins
5. Copy Client ID to both backend `.env` (GOOGLE_CLIENT_ID) and frontend `.env` (VITE_GOOGLE_CLIENT_ID)

Without Google: Use **Create account** and **Sign in** with email/password.

## Login & Auth

- **Create account** – Sign up with email, name, password
- **Sign in** – Email + password
- **Sign in with Google** – When GOOGLE_CLIENT_ID is configured
- **Forgot password** – Enter email to get reset link (token shown in dev mode)
- **Reset password** – Enter token from email + new password
- **Logout** – Tap profile icon (👤) in bottom nav → Logout

**Data per account:** Each user sees only their own products and bills. Different Google/email accounts = different data.

## Features

- Home: Today's sales, low stock alerts
- Products: Search, category filter, add to bill, remove
- Bill Centre: Customer name/phone, UPI QR, GST 18%, Save/Pay Later
- Bill History: View bills, edit Pay Later bills
- Admin: Add/Edit/Delete products, Update stock, Reset All
