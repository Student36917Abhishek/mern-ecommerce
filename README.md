# MERN E-Commerce Project

## Day 1

Project planning only. No frontend or backend coding yet.

## Day 21

Checkout UI completed with shipping form, order summary, and place-order flow.

### Work Completed

1. Added order API helpers for metadata and order placement.
2. Added `/checkout` route as a protected page.
3. Added a checkout handoff from the cart page.
4. Built a shipping address form with payment method and notes.
5. Rendered cart items and totals in a checkout summary panel.

### Checkout UI Focus

- The checkout page now turns cart data into a proper order submission flow.

## Day 23

Admin UI basics completed with product management tools for add, edit, and delete flows.

### Work Completed

1. Added admin-only route protection using the user role from auth state.
2. Added admin product CRUD helpers in the frontend service layer.
3. Created a dedicated admin product management workspace.
4. Added a product form for creating and updating catalog items.
5. Added an inventory list with edit and delete actions.
6. Exposed the admin route in the main navigation for admin users.
7. Kept the layout aligned with the existing bold frontend visual language.

### Admin UI Focus

- Admin users can manage products from one focused screen.
- The page reuses the backend product APIs already built earlier.
- The admin flow is simple enough for an internship MVP but still functional.

### Learning Outcomes

- Learned how to gate UI features by user role.
- Practiced building a compact CRUD admin screen in React.
- Prepared the app for full integration testing next.

## Day 22

Orders UI completed with my orders list and detailed order tracking page.

### Work Completed

1. Added frontend order API helpers for list and detail fetching.
2. Added protected `/orders` route for the logged-in user's order history.
3. Added protected `/orders/:orderId` route for detailed order tracking.
4. Built a compact order card layout with status, total, items, and date.
5. Built a detailed order page with tracking timeline, shipping address, and summary.
6. Updated shell navigation to expose the orders page.
7. Wired checkout success path toward the upcoming order history workflow.

### Orders UI Focus

- The user can now review past purchases and inspect a single order snapshot.
- The detail page mirrors the backend order structure for clear tracking.
- The checkout-to-orders journey is now complete on the frontend.

### Learning Outcomes

- Learned how to present user order history from backend order APIs.
- Practiced designing both summary and detail views for the same dataset.
- Strengthened the post-checkout experience before admin product work.

### Learning Outcomes

- Learned how to design a checkout form around a backend order API.
- Practiced combining cart data, address capture, and order submission in one page.
- Prepared the app for user order history screens next.
  Backend foundation setup completed with Node.js, Express, and MongoDB integration.

### Work Completed

1. Initialized backend project inside `server/` with `npm init -y`.
2. Installed core dependencies: `express`, `mongoose`, `cors`, `dotenv`.
3. Installed dev dependency: `nodemon`.
4. Created scalable backend folder structure:

```
server
|- config/
|  |- db.js
|- controllers/
|- middleware/
|- models/
|- routes/
|- utils/
|- .env
|- .env.example
|- server.js
|- package.json
```

5. Implemented Express server in `server/server.js`:
   - Added middleware: `cors()` and `express.json()`.
   - Added root test route: `GET /` returns `Ecommerce API running`.
   - Added health route: `GET /api/health` for quick status checks.
   - Configured dynamic port using `process.env.PORT || 5000`.

## Day 17

## Day 19

1. Added frontend helpers for fetching product lists and single product details.
2. Added `/products` route for the catalog grid.
3. Added `/products/:productId` route for detailed product views.
4. Created a reusable product card with image, category, price, and stock status.
5. Added loading, empty, and error states for catalog browsing.
6. Built a styled product detail page with image, description, and product metadata.
7. Updated the shell navigation and home page to lead into the catalog flow.

### Product UI Focus

- The catalog now reads from the backend product API instead of static placeholders.
- The layout is built to feel intentional, bold, and demo-ready.
- The product detail page sets up a clean handoff for cart work on Day 20.

### Learning Outcomes

Auth frontend work completed with stronger login/register flows and token validation on app boot.

### Work Completed

3. Added show/hide password controls to login and registration forms.
4. Added form helper text and clearer auth page messaging.
5. Kept the auth screens aligned with the backend API contract.

### Auth UI Focus

- Login and register pages now feel more finished and demo-ready.
- Existing auth state is revalidated from the backend before showing protected content.
- The UI now avoids stale token flicker on reload.

### Learning Outcomes

- Learned how to validate stored auth state using a protected backend endpoint.
- Practiced improving form usability without adding unnecessary complexity.
- Strengthened the frontend auth experience before product listing work.

4. Created auth persistence and login/register actions in `client/src/context/AuthContext.jsx`.
5. Added protected routing in `client/src/components/ProtectedRoute.jsx`.
6. Built a shell layout with navigation and branded landing page framing.
7. Added login, register, dashboard, and not-found pages.
8. Replaced the starter Vite UI with a custom visual system and responsive layout.

### Frontend Scope

- Routing is ready for auth and protected app pages.
- Token persistence is wired through local storage.
- Axios is configured for future authenticated requests.
- The UI uses a custom dark visual style with bold gradients and glass panels.

### Learning Outcomes

- Learned how to initialize a React frontend for an existing backend.
- Practiced setting up reusable API and auth layers early.
- Built a cleaner app shell that can support the product, cart, and checkout screens next.
  - `npm run dev` -> starts backend with nodemon
  - `npm start` -> starts backend with node

### Learning Outcomes

- Learned backend project initialization and dependency setup for MERN.
- Understood Express app bootstrapping and middleware usage.
- Learned to organize backend code into clean, scalable folders.
- Practiced secure configuration via environment variables.
- Connected Node.js app to MongoDB using Mongoose.
- Verified API startup and health endpoints.

## Day 3

Authentication system setup completed with user registration and login APIs.

### Work Completed

1. Installed authentication packages: `bcryptjs` and `jsonwebtoken`.
2. Created the `User` database model in `server/models/User.js`.
3. Defined the user schema using Mongoose.
4. Created the authentication route file in `server/routes/authRoutes.js`.
5. Implemented the user registration API.
6. Implemented password hashing using bcrypt.
7. Implemented the user login API.
8. Connected auth routes to the Express server.
9. Tested the register API using Postman.
10. Tested the login API successfully.

### Learning Outcomes

- Learned how to create and structure authentication flows in a MERN backend.
- Understood how to securely hash and store passwords with bcrypt.
- Practiced generating and using JWT-based authentication.
- Verified registration and login endpoints with API testing tools.

## Day 4

JWT authentication and protected routes setup completed for the MERN e-commerce backend.

### Work Completed

1. Added JWT secret and token config in `server/.env.example`.
2. Created token generation helpers in `server/utils/generateToken.js`.
3. Updated the login flow to return authentication tokens.
4. Created authentication middleware in `server/middleware/authMiddleware.js`.
5. Added a protected profile route in `server/routes/authRoutes.js`.
6. Connected protected routes through the Express server.
7. Tested JWT login flow using Postman.
8. Tested protected API access with a Bearer token.

### JWT Flow

```text
User Login
   ↓
Server verifies email and password
   ↓
Server generates JWT token
   ↓
Token sent to frontend
   ↓
Frontend sends token in future requests
   ↓
Backend verifies token
   ↓
User gets access to protected resources
```

### Environment Setup

Add this to `server/.env` and keep the same keys in `server/.env.example`:

```env
JWT_SECRET=mysecretkey
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=myrefreshsecretkey
JWT_REFRESH_EXPIRE=7d
```

### Token Helper

File: `server/utils/generateToken.js`

```js
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
```

### Login API With Token

File: `server/controllers/authController.js`

```js
const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

return res.status(200).json({
  message: "Login successful.",
  accessToken,
  refreshToken,
  user: sanitizeUser(user),
});
```

### Authentication Middleware

File: `server/middleware/authMiddleware.js`

```js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Not authorized. Token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ message: "User not found." });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = { protect };
```

### Protected Route

File: `server/routes/authRoutes.js`

```js
router.get("/profile", protect, getProfile);
```

Test request:

```http
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

### Learning Outcomes

- Understood how JWT authentication works in backend systems.
- Learned how to generate authentication tokens using `jsonwebtoken`.
- Practiced implementing secure login responses with JWT.
- Understood the concept of stateless authentication.
- Learned how to store user identity inside a token.
- Practiced creating authentication middleware in Express.
- Learned how to protect backend routes using middleware.
- Understood how tokens are sent in API request headers.
- Practiced testing authenticated APIs using Postman.
- Implemented a secure authentication flow for the e-commerce application.

## Day 5

Product management system setup completed with Product model and product APIs.

### Work Completed

1. Created `Product` database model in `server/models/Product.js`.
2. Defined product schema fields: `name`, `description`, `price`, `category`, `stock`, `image`.
3. Created product route file in `server/routes/productRoutes.js`.
4. Implemented Add Product API.
5. Implemented Get All Products API.
6. Implemented Get Product by ID API.
7. Connected product routes to Express server in `server/server.js`.

### APIs Added

- `POST /api/products` -> add a product (protected: admin only)
- `GET /api/products` -> fetch all products
- `GET /api/products/:id` -> fetch single product by ID

### Day 5.1 Sample Product Seeding

- Seed sample products: `npm run seed:products`
- Remove all products: `npm run seed:products:destroy`

Seeder file: `server/seeders/productSeeder.js`

### Learning Outcomes

- Understood how product data is structured in an e-commerce database.
- Learned how to design a Product schema using Mongoose.
- Practiced creating REST APIs for product management.
- Learned how to insert product data into MongoDB using Mongoose.
- Understood how to retrieve all products and single product details by ID.
- Practiced modular backend structure by using a separate product routes file.
- Connected product APIs with the Express server for frontend integration.

## Day 6

Product management APIs completed with update/delete endpoints and request validation.

### Work Completed

1. Implemented Update Product API.
2. Implemented Delete Product API.
3. Added product create request validation.
4. Added product update request validation.
5. Restricted add/update/delete product endpoints to admin users.
6. Added safer API handling for invalid product IDs and missing products.

### APIs Added (Day 6)

- `PUT /api/products/:id` -> update product (protected: admin only)
- `DELETE /api/products/:id` -> delete product (protected: admin only)

### Validation Rules Added

- Required on create: `name`, `description`, `price`
- `name` minimum 2 characters
- `description` minimum 5 characters
- `price` must be non-negative number
- `stock` must be non-negative number
- Only allowed fields can be updated

### Learning Outcomes

- Practiced implementing update and delete operations in REST APIs.
- Learned to validate product payloads for create and update flows.
- Improved API reliability with structured error responses.
- Reinforced admin-only access control for product management endpoints.

## Day 7

Product query features completed with search, filter, sort, and pagination support.

### Work Completed

1. Enhanced `GET /api/products` with search by product name.
2. Added category filtering for product listing.
3. Added price range filtering using minimum and maximum price.
4. Added sorting options for date, price, and name.
5. Added pagination with page and limit query params.
6. Added response metadata for pagination and applied filters.

### Product Listing Query Params

- `search` -> search by product name (case-insensitive)
- `category` -> filter by category
- `minPrice` -> minimum product price
- `maxPrice` -> maximum product price
- `sort` -> `newest`, `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`
- `page` -> page number (default `1`)
- `limit` -> page size (default `10`, max `100`)

### Example Requests

- `GET /api/products?search=shoe`
- `GET /api/products?category=Footwear&sort=price_asc`
- `GET /api/products?minPrice=1000&maxPrice=5000&page=1&limit=8`

### Learning Outcomes

- Learned how to build query-based product listing APIs.
- Practiced implementing pagination for scalable product browsing.
- Understood server-side filtering and sorting for frontend-ready catalog pages.
- Improved API response design with metadata for UI integration.

## Day 8

Product admin security checks completed with verified role-based access and full CRUD test flow.

### Work Completed

1. Added admin bootstrap seeder for fast testing setup.
2. Added npm command to create or promote admin user.
3. Verified admin login and token-based product create/update/delete flow.
4. Verified non-admin access is blocked for admin-only product routes.
5. Finalized Day 8 API testing checklist for repeatable verification.

### Setup Command

- `npm run seed:admin` -> creates or promotes `admin@ecommerce.com` as admin

### Day 8 Verification Checklist

1. Login as admin and copy `accessToken`.
2. `POST /api/products` with Bearer token -> should return `201`.
3. `PUT /api/products/:id` with Bearer token -> should return `200`.
4. `DELETE /api/products/:id` with Bearer token -> should return `200`.
5. Try admin routes without token -> should return `401`.
6. Try admin routes with non-admin token -> should return `403`.

### Learning Outcomes

- Practiced role-based authorization testing for admin-only APIs.
- Learned how to bootstrap admin credentials for local development.
- Validated complete secured product management flow end-to-end.

## Day 9

Cart module foundation completed with protected cart model and core cart APIs.

### Work Completed

1. Created `Cart` database model in `server/models/Cart.js`.
2. Designed cart schema with user-linked cart items.
3. Added cart totals tracking (`subtotal`, `totalItems`).
4. Created cart route file in `server/routes/cartRoutes.js`.
5. Implemented Add to Cart API.
6. Implemented View Cart API.
7. Implemented Update Cart Item Quantity API.
8. Implemented Remove Cart Item API.
9. Implemented Clear Cart API.
10. Connected cart routes to Express server in `server/server.js`.

### APIs Added (Day 9)

- `GET /api/cart` -> get current user cart (protected)
- `POST /api/cart` -> add item to cart (protected)
- `PUT /api/cart/:productId` -> update cart item quantity (protected)
- `DELETE /api/cart/:productId` -> remove item from cart (protected)
- `DELETE /api/cart` -> clear all cart items (protected)

### Learning Outcomes

- Learned how to model user-specific cart data in MongoDB.
- Practiced implementing protected cart APIs in Express.
- Implemented reusable cart total recalculation logic.
- Built cart CRUD foundation for upcoming checkout and order flow.

## Day 10

Cart logic polished with quantity limits, stronger stock handling, and checkout-ready totals.

### Work Completed

1. Added max quantity-per-item validation in cart APIs.
2. Improved stock checks for add and update cart actions.
3. Added cart-product sync on cart fetch to keep price and item data current.
4. Auto-removed unavailable/out-of-stock cart items during sync.
5. Added advanced totals in cart model: `tax`, `shippingFee`, `grandTotal`.
6. Implemented tax and shipping fee calculation logic.

### Cart Logic Rules (Day 10)

- Maximum quantity per product in cart: `10`
- Item is blocked if requested quantity exceeds stock
- Item is blocked if product is out of stock
- Shipping fee is waived for higher subtotal carts
- Cart totals are recalculated after every cart mutation

### Learning Outcomes

- Practiced implementing business rules for cart integrity.
- Learned how to keep cart snapshots synchronized with live product data.
- Built checkout-ready total calculation fields for upcoming order module.

## Day 11

Cart API polish completed with consistent response contracts and checkout preview support.

### Work Completed

1. Standardized cart API response format with `message`, `cart`, and `summary`.
2. Added reusable cart summary payload for frontend integration.
3. Added `GET /api/cart/checkout-preview` endpoint.
4. Added checkout readiness flag (`canCheckout`) based on cart state.
5. Improved cart UX contract for upcoming order placement flow.

### APIs Added (Day 11)

- `GET /api/cart/checkout-preview` -> validates and returns checkout-ready cart snapshot (protected)

### Response Contract

- `message` -> operation status text
- `cart` -> full cart document
- `summary` -> `totalItems`, `subtotal`, `tax`, `shippingFee`, `grandTotal`

### Learning Outcomes

- Practiced API contract design for frontend and checkout workflows.
- Improved consistency across cart endpoints for easier client handling.
- Prepared backend cart data flow for order module implementation.

## Day 12

Order module foundation completed with Order model setup and protected order routing.

### Work Completed

1. Created `Order` database model in `server/models/Order.js`.
2. Added order item snapshot structure (`product`, `name`, `image`, `price`, `quantity`).
3. Added required shipping address schema for delivery data.
4. Added pricing fields (`subtotal`, `tax`, `shippingFee`, `grandTotal`, `totalItems`).
5. Added payment fields (`paymentMethod`, `paymentStatus`, `transactionId`, `isPaid`, `paidAt`).
6. Added order lifecycle fields (`orderStatus`, `deliveredAt`).
7. Created protected order route file `server/routes/orderRoutes.js`.
8. Added order metadata endpoint for Day 13 integration readiness.
9. Connected order routes to Express server in `server/server.js`.

### APIs Added (Day 12)

- `GET /api/orders/meta` -> returns payment and order status metadata (protected)

### Learning Outcomes

- Learned how to design an order schema for real checkout snapshots.
- Prepared backend structure for place-order implementation.
- Established order module routing for next phase development.

## Day 13

Place-order flow implemented from cart snapshot with stock validation and post-order cart cleanup.

### Work Completed

1. Implemented `POST /api/orders` endpoint (protected).
2. Added shipping address validation for order placement.
3. Added payment method validation (`cod`, `card`, `upi`).
4. Built order snapshot from cart items with current product price.
5. Added stock validation before placing order.
6. Added order totals calculation (`subtotal`, `tax`, `shippingFee`, `grandTotal`, `totalItems`).
7. Reduced product stock after successful order placement.
8. Cleared user cart automatically after order creation.

### APIs Added (Day 13)

- `POST /api/orders` -> place order from current cart (protected)

### Learning Outcomes

- Practiced converting cart state into persistent order snapshots.
- Learned order placement safety checks for stock and input validation.
- Implemented core backend flow required for checkout completion.

## Day 14

User order retrieval flow completed with protected "my orders" list and order detail endpoints.

### Work Completed

1. Implemented `GET /api/orders/my` endpoint (protected).
2. Added descending order history sorting by creation date.
3. Added compact order list response for account page usage.
4. Implemented `GET /api/orders/:id` endpoint (protected).
5. Added ownership check so users can access only their own orders.
6. Added order ID validation and proper not-found handling.

### APIs Added (Day 14)

- `GET /api/orders/my` -> fetch logged-in user's orders (protected)
- `GET /api/orders/:id` -> fetch logged-in user's single order details (protected)

### Learning Outcomes

## Day 16

Backend cleanup pass completed with shared response helpers and standardized error middleware.

### Work Completed

1. Added shared API success helper in `server/utils/apiResponse.js`.
2. Added centralized `notFound` and `errorHandler` middleware.
3. Wired standardized error middleware into `server/server.js`.
4. Updated core product, cart, and order routes to use consistent success payloads.
5. Kept business logic unchanged while improving response consistency.

### Cleanup Focus

- Standardized success response shape with `success`, `message`, and payload data.
- Standardized error response shape with `success: false` and `message`.
- Centralized 404 handling for unknown routes.

### Learning Outcomes

- Learned how to reduce response inconsistency across backend routes.
- Practiced introducing shared helpers without changing feature behavior.
- Improved backend maintainability before frontend-heavy work.

## Day 15

Admin order management APIs completed with all-orders view and order status update flow.

### Work Completed

1. Implemented `GET /api/orders/admin/all` endpoint (protected: admin only).
2. Added admin response summary with `count` and `totalRevenue`.
3. Implemented `PUT /api/orders/admin/:id/status` endpoint (protected: admin only).
4. Added order status validation for lifecycle updates.
5. Added `deliveredAt` auto-update behavior when status becomes `delivered`.
6. Fixed route ordering to prevent `/:id` from shadowing admin routes.

### APIs Added (Day 15)

- `GET /api/orders/admin/all` -> fetch all orders (admin only)
- `PUT /api/orders/admin/:id/status` -> update order status (admin only)

### Learning Outcomes

- Practiced building admin-only order management endpoints.
- Learned how to aggregate simple order metrics for admin dashboards.
- Implemented secure status transitions for order lifecycle handling.

## Day 24

Full integration testing completed across the live register, browse, cart, checkout, and order-history flow.

### Test Flow

1. Registered a fresh user through the auth API.
2. Fetched products from the live catalog API.
3. Added a product to the cart.
4. Verified checkout preview readiness.
5. Placed an order with shipping details.
6. Verified the order appears in `GET /api/orders/my`.
7. Verified the order detail endpoint returns the saved snapshot.
8. Confirmed the cart clears after successful order placement.

### Validation Results

- Registration: passed
- Product browse: passed
- Cart add: passed
- Checkout preview: passed
- Place order: passed
- My orders: passed
- Order detail: passed
- Cart cleared after order: passed

### Learning Outcomes

- Learned how to verify the full e-commerce journey against live backend endpoints.
- Confirmed the frontend and backend work together as one flow.
- Identified the app as ready for demo polish and final cleanup work.

## Day 25

Demo readiness cleanup completed with final UI polish and README wrap-up. Deployment is deferred for later.

### Work Completed

1. Refined the home page messaging for a more complete demo presentation.
2. Added a visible demo-ready badge in the main shell header.
3. Tightened the overall landing copy to reflect the full commerce MVP.
4. Kept the UI focused on walkthrough clarity instead of extra features.
5. Documented the final day status and noted deployment as optional later.

### Demo Readiness Focus

- The app now reads as a complete internship MVP from landing to checkout.
- Final polish centered on clarity, presentation, and demo flow.
- Deployment is intentionally left for later as requested.

### Learning Outcomes

- Learned how small UI changes can improve the demo quality of a full-stack app.
- Practiced finishing work with a presentation-minded cleanup pass.
- Closed the project with a polished, easy-to-walk-through frontend.

## Architecture

Client (React)
-> API Requests
Server (Node.js + Express)
-> Mongoose
MongoDB Database
