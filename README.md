# Electronify

A modern e-commerce platform specializing in electronics and technology products. Built with React and featuring a clean design with comprehensive shopping functionality.

## 🚀 Features

### Core Functionality

- **Product Catalog**: Browse through a curated selection of electronics including laptops, smartphones, accessories, and monitors
- **Advanced Search & Filtering**: Filter products by category, price range, and search by name
- **Product Details**: Detailed product pages with images, descriptions, ratings, and customer reviews
- **Shopping Cart**: Add items to cart, manage quantities, and proceed to checkout
- **User Authentication**: Secure user registration and login system
- **Review System**: Users can leave ratings and reviews for products

### User Experience

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Cart Updates**: Live cart counter and instant feedback
- **Offline Support**: Fallback to local data when API is unavailable
- **Intuitive Navigation**: Clean header with logo, navigation, and cart access
- **Star Ratings**: Visual product ratings with review counts

### Technical Features

- **React 19**: Latest React version with modern hooks and context
- **React Router**: Client-side routing for seamless navigation
- **CSS Modules**: Scoped styling for maintainable CSS
- **Context API**: Global state management for cart and authentication
- **RESTful API**: Integration with backend services
- **Local Storage**: Persistent cart and user session management

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0, React Router DOM 7.6.2
- **Styling**: CSS Modules, responsive design
- **State Management**: React Context API
- **Build Tool**: Create React App
- **Backend**: REST API (localhost:8080)

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Backend API server running on localhost:8080

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd electronify
   ```

2. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## 🏗️ Project Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   └── Footer/
│   │   ├── CategoryFilter/
│   │   ├── PriceFilter/
│   │   ├── ProductCard/
│   │   ├── ProductList/
│   │   ├── ReviewForm/
│   │   ├── SearchFilter/
│   │   ├── Sidebar/
│   │   ├── SortFilter/
│   │   └── StarRating/
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   ├── data/
│   │   └── products.js
│   ├── pages/
│   │   ├── CartPage/
│   │   ├── HomePage/
│   │   ├── LoginPage/
│   │   ├── ProductDetailPage/
│   │   └── RegisterPage/
│   ├── services/
│   │   └── api.js
│   ├── images/
│   ├── App.js
│   └── index.js
└── package.json
```

## 🎯 Key Pages

### Homepage (`/`)

- Product catalog with filtering and search
- Category-based navigation
- Price range filtering
- Sorting options (price, rating, name)

### Product Detail (`/product/:id`)

- Detailed product information
- Image gallery
- Customer reviews and ratings
- Add to cart functionality
- Review submission (authenticated users)

### Shopping Cart (`/cart`)

- Cart item management
- Quantity updates
- Price calculations
- Checkout process (requires authentication)

### Authentication (`/login`, `/register`)

- User registration and login
- Secure session management
- Redirect handling after authentication

## 🔧 Configuration

### Environment Setup

The application expects a backend API server running on `localhost:8080`. The API endpoints include:

- `GET /api/products` - Fetch all products
- `GET /api/products/:id` - Fetch product by ID
- `GET /api/products/filter` - Filter products
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/reviews/byProduct` - Fetch product reviews
- `POST /api/reviews` - Submit product review

### Offline Mode

The application includes fallback functionality using local product data when the API is unavailable, ensuring a consistent user experience.

## 🎨 Design Features

- **Clean, Modern UI**: Professional design with consistent branding
- **Intuitive UX**: User-friendly navigation and clear call-to-actions
- **Visual Feedback**: Loading states, success messages, and error handling
- **Accessibility**: Semantic HTML and keyboard navigation support

## 🔍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
