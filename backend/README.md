# PlusWay Backend API

Backend server for PlusWay Multi-Vendor E-commerce platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Customer, Delivery)
- **Product Management**: CRUD operations for products, categories, brands
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Razorpay payment gateway
- **Image Storage**: Cloudinary integration for product images
- **Security**: Helmet, rate limiting, XSS protection, MongoDB sanitization
- **Analytics**: Sales, revenue, and customer analytics
- **Delivery Management**: Delivery boy tracking and order assignment

## Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (jsonwebtoken)
- **File Storage**: Cloudinary
- **Payment**: Razorpay
- **Security**: Helmet, express-rate-limit, xss-clean, express-mongo-sanitize

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account
- Razorpay account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your actual credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## Environment Variables

See `.env.example` for required environment variables:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for signing JWT tokens
- `CLOUDINARY_*` - Cloudinary configuration
- `RAZORPAY_*` - Razorpay payment gateway keys
- `FRONTEND_URL` - Frontend URL for CORS

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### More endpoints for:
- Reviews
- Wishlist
- Addresses
- Brands
- Banners
- Analytics
- Delivery
- Financial reports

## Project Structure

```
backend/
├── controllers/      # Request handlers
├── models/          # Mongoose schemas
├── routes/          # API routes
├── middleware/      # Custom middleware (auth, security)
├── .env.example     # Environment variables template
├── server.js        # Application entry point
├── package.json     # Dependencies
└── DEPLOYMENT.md    # Deployment guide
```

## Security Features

- **Helmet**: Secure HTTP headers
- **Rate Limiting**: 1000 requests per minute per IP
- **XSS Protection**: Cross-Site Scripting prevention
- **NoSQL Injection**: MongoDB sanitization
- **CORS**: Configured for specific frontend origins
- **JWT**: Secure token-based authentication

## Development

### Run in development mode:
```bash
npm run dev
```

### Run in production mode:
```bash
npm start
```

### Check health:
```bash
curl http://localhost:5000/health
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Render.

**Quick Deploy to Render:**
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Add environment variables
5. Deploy!

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build command (no-op for Node.js)

## Database Models

- **Admin** - Admin users
- **Customer** - Customer accounts
- **DeliveryBoy** - Delivery personnel
- **Product** - Product catalog
- **Category** - Product categories
- **Brand** - Product brands
- **Order** - Customer orders
- **Cart** - Shopping cart items
- **Review** - Product reviews
- **Wishlist** - Customer wishlists
- **Address** - Delivery addresses
- **Banner** - Homepage banners
- **Deal** - Special deals
- **Transaction** - Payment records

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

Error responses include:
```json
{
  "message": "Error description"
}
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
