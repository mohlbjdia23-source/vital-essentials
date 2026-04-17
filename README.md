# Vital Essentials – Dropshipping Store

A full-stack dropshipping store built with **Node.js / Express / MongoDB** on the backend and **React / Vite / Tailwind CSS** on the frontend, integrated with **Stripe** for payments and **AliExpress** for automated order fulfilment.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Local Development](#local-development)
5. [Database Seeding](#database-seeding)
6. [API Reference](#api-reference)
7. [Dropshipping Workflow](#dropshipping-workflow)
8. [Supplier Integration](#supplier-integration)
9. [Admin Operations](#admin-operations)
10. [Stripe Webhooks](#stripe-webhooks)
11. [Production Deployment](#production-deployment)

---

## Architecture

```
vital-essentials/
├── index.js                  # Express server entrypoint
├── seed.js                   # Database seed script
├── server/
│   ├── models/               # Mongoose data models
│   │   ├── Product.js        # Product with supplier metadata
│   │   ├── Order.js          # Full-lifecycle order model
│   │   ├── User.js           # Customer / admin accounts
│   │   └── Cart.js           # Persisted carts (user + guest)
│   ├── routes/               # Express routers
│   │   ├── products.js       # CRUD + search/filter/pagination
│   │   ├── orders.js         # Order management
│   │   ├── checkout.js       # Payment intent + order creation
│   │   ├── users.js          # Auth (register/login/me)
│   │   ├── cart.js           # MongoDB-backed cart
│   │   ├── admin.js          # Admin: import, sync, fulfilment
│   │   └── webhooks.js       # Stripe webhook handler
│   ├── middleware/
│   │   └── auth.js           # JWT middleware (requireAuth, requireAdmin, optionalAuth)
│   ├── suppliers/
│   │   ├── index.js          # Supplier registry
│   │   └── aliexpress.js     # AliExpress adapter
│   └── lib/
│       ├── fulfillment.js    # submitToSupplier, refreshTracking
│       └── validation.js     # Input validation helpers
└── client/                   # React + Vite frontend
    └── src/
        ├── App.jsx
        ├── components/       # Header, Footer, Cart, Checkout, ProductCard
        ├── context/          # CartContext
        └── pages/            # Home, Products, ProductDetail, Orders, OrderConfirmation
```

---

## Prerequisites

- **Node.js** ≥ 18
- **MongoDB** ≥ 5 (local or Atlas)
- **Stripe** account (test mode for development)
- **AliExpress Open Platform** credentials (optional for MVP – supplier calls are stubbed)

---

## Environment Variables

Copy `.env.example` to `.env` and fill in every value:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Long random string for JWT signing |
| `JWT_EXPIRES_IN` | | Token expiry (default: `7d`) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ (production) | Stripe webhook signing secret |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key (`pk_test_...`) |
| `ALIEXPRESS_APP_KEY` | | AliExpress API app key |
| `ALIEXPRESS_APP_SECRET` | | AliExpress API app secret |
| `ALIEXPRESS_ACCESS_TOKEN` | | AliExpress OAuth access token |
| `SUPPLIER_CURRENCY` | | Default supplier currency (default: `USD`) |
| `PORT` | | Server port (default: `5000`) |
| `NODE_ENV` | | `development` or `production` |

---

## Local Development

```bash
# 1. Install backend dependencies
npm install

# 2. Install frontend dependencies
cd client && npm install && cd ..

# 3. Configure environment
cp .env.example .env   # then edit .env

# 4. Seed the database
node seed.js

# 5. Start the backend API server (port 5000)
npm start

# 6. Start the frontend dev server (port 3000, proxies /api → :5000)
cd client && npm run dev
```

Visit **http://localhost:3000** for the storefront.

---

## Database Seeding

The seed script creates **100 products** across 9 categories and creates a default admin user.

```bash
node seed.js
```

Default admin credentials (override via env vars):
- **Email**: `admin@vitalessentials.com`
- **Password**: `Admin123!` — **change immediately in production**

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` to use different credentials.

---

## API Reference

### Authentication

All write endpoints (create/update/delete products, manage orders) require a JWT bearer token.  
Obtain a token by logging in: `POST /api/users/login`

```
Authorization: Bearer <token>
```

### Endpoints

#### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/users/register` | — | Register a new customer |
| POST | `/api/users/login` | — | Login, returns JWT |
| GET | `/api/users/me` | 🔐 | Get current user profile |
| PUT | `/api/users/me` | 🔐 | Update name/address |

#### Products
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | List products (paginated, filterable) |
| GET | `/api/products/:id` | — | Get single product |
| POST | `/api/products` | 🔐 Admin | Create product |
| PUT | `/api/products/:id` | 🔐 Admin | Update product |
| DELETE | `/api/products/:id` | 🔐 Admin | Soft-delete (deactivate) |

**Query parameters for `GET /api/products`:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Full-text search |
| `category` | string | Filter by category |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |
| `sort` | string | `createdAt`, `price`, `name` |
| `order` | string | `asc` or `desc` |

#### Cart
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | Optional | Get cart |
| POST | `/api/cart/items` | Optional | Add item |
| PUT | `/api/cart/items/:productId` | Optional | Update quantity |
| DELETE | `/api/cart/items/:productId` | Optional | Remove item |
| DELETE | `/api/cart` | Optional | Clear cart |

Guest carts use `X-Session-Id` header (UUID generated client-side).

#### Checkout
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/checkout/create-payment-intent` | Optional | Create verified PaymentIntent |
| POST | `/api/checkout/confirm-payment` | Optional | Confirm payment, create order |

#### Orders
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | 🔐 | List own orders (admin sees all) |
| GET | `/api/orders/by-email/:email` | — | Guest order lookup |
| GET | `/api/orders/:id` | Optional | Get order detail |
| PUT | `/api/orders/:id` | 🔐 Admin | Update status/tracking |
| POST | `/api/orders/:id/refresh-tracking` | 🔐 Admin | Pull tracking from supplier |

#### Admin
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/products/import` | 🔐 Admin | Import product from supplier |
| POST | `/api/admin/products/sync` | 🔐 Admin | Sync all product prices/stock |
| GET | `/api/admin/fulfillment/queue` | 🔐 Admin | Unfulfilled paid orders |
| POST | `/api/admin/fulfillment/:id/submit` | 🔐 Admin | Trigger supplier submission |
| POST | `/api/admin/fulfillment/:id/cancel` | 🔐 Admin | Cancel order |
| POST | `/api/admin/orders/:id/refund` | 🔐 Admin | Issue full or partial refund |

---

## Dropshipping Workflow

```
Customer Checkout
      │
      ▼
POST /api/checkout/create-payment-intent
  ├─ Validates cart items against DB
  ├─ Calculates server-side total (prevents price tampering)
  ├─ Creates Stripe PaymentIntent
  └─ Creates pending Order with idempotency key
      │
      ▼
Stripe payment confirmed in browser
      │
      ▼
POST /api/checkout/confirm-payment   (client-side, non-blocking)
  └─ Marks order as `paid`, triggers supplier submission
      │
      ▼ (also via Stripe webhook for reliability)
POST /api/webhooks/stripe
  └─ payment_intent.succeeded → marks Order.paymentStatus = 'paid'
                               → calls submitToSupplier()
      │
      ▼
submitToSupplier() [server/lib/fulfillment.js]
  ├─ Groups order items by supplier
  ├─ Calls AliExpress placeOrder() API
  ├─ Saves supplierOrderId
  ├─ Updates fulfillmentStatus = 'submitted'
  └─ Retries up to 3× on failure; sets 'failed' for admin intervention
      │
      ▼
Admin refreshes tracking (manual or automated)
POST /api/orders/:id/refresh-tracking
  └─ Calls AliExpress getTracking()
     Updates tracking number, carrier, URL
     Sets fulfillmentStatus = 'shipped'
```

---

## Supplier Integration

The supplier layer uses an adapter pattern. All adapters expose the same interface:

```js
searchProducts(keyword, options)
getProduct(supplierProductId)
checkPriceAndStock(supplierProductId)
placeOrder({ items, shippingAddress })
getTracking(supplierOrderId)
```

**Adding a new supplier:**
1. Create `server/suppliers/mysupplier.js` implementing all five methods
2. Register it in `server/suppliers/index.js`
3. Set `supplier.name = 'mysupplier'` on Product documents

**AliExpress setup:**
1. Register at [developers.aliexpress.com](https://developers.aliexpress.com/)
2. Create an app and obtain `APP_KEY`, `APP_SECRET`, `ACCESS_TOKEN`
3. Add them to `.env`

---

## Admin Operations

### Import a product from AliExpress

```bash
curl -X POST http://localhost:5000/api/admin/products/import \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"supplierProductId":"3256802415383817","price":29.99,"category":"Electronics"}'
```

### Sync all product prices and stock

```bash
curl -X POST http://localhost:5000/api/admin/products/sync \
  -H "Authorization: Bearer <admin-token>"
```

### View the fulfilment queue

```bash
curl http://localhost:5000/api/admin/fulfillment/queue \
  -H "Authorization: Bearer <admin-token>"
```

### Manually submit a failed order to supplier

```bash
curl -X POST http://localhost:5000/api/admin/fulfillment/<orderId>/submit \
  -H "Authorization: Bearer <admin-token>"
```

### Issue a refund

```bash
# Full refund
curl -X POST http://localhost:5000/api/admin/orders/<orderId>/refund \
  -H "Authorization: Bearer <admin-token>"

# Partial refund of $10
curl -X POST http://localhost:5000/api/admin/orders/<orderId>/refund \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":10.00}'
```

---

## Stripe Webhooks

In production, configure a Stripe webhook pointing to:

```
https://yourdomain.com/api/webhooks/stripe
```

Events handled:
- `payment_intent.succeeded` → marks order as paid, triggers supplier
- `payment_intent.payment_failed` → marks payment as failed
- `charge.refunded` → marks order as refunded

**Local testing with Stripe CLI:**

```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

Copy the printed webhook secret into `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## Production Deployment

```bash
# Build the React frontend
cd client && npm run build && cd ..

# Set NODE_ENV=production in your environment
# The Express server will serve the React build from client/dist

NODE_ENV=production npm start
```

**Checklist before going live:**
- [ ] Set strong `JWT_SECRET` (minimum 32 random characters)
- [ ] Use Stripe **live** keys (`sk_live_...`, `pk_live_...`)
- [ ] Configure Stripe webhook with live signing secret
- [ ] Use MongoDB Atlas or equivalent hosted MongoDB
- [ ] Change the default admin password
- [ ] Set `ALIEXPRESS_*` credentials
- [ ] Enable HTTPS (SSL termination at load balancer or reverse proxy)
- [ ] Review and tighten rate limits for your expected traffic