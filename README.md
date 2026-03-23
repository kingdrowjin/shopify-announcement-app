# Shopify Announcement App

A Shopify app built with the MERN stack that allows store admins to set announcement banners that display on the storefront via a Theme App Extension.

## Architecture

**Data Flow:** Admin Dashboard → MongoDB (audit history) → Shopify Metafields API → Storefront (Theme App Extension)

## Tech Stack

- **Frontend**: React + Shopify Polaris
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Shopify**: Admin API (REST) + Theme App Extension (Liquid)

## Setup

### Prerequisites
- Node.js v18+
- [Shopify Partner Account](https://partners.shopify.com)
- A Shopify Development Store
- MongoDB Atlas account (free tier)

### 1. Shopify Setup

1. Create a Partner account at [partners.shopify.com](https://partners.shopify.com)
2. Create a Development Store in your Partner Dashboard
3. Create a custom app in your development store:
   - Go to **Settings → Apps and sales channels → Develop apps**
   - Create an app and configure Admin API scopes: `write_metafields`, `read_metafields`
   - Install the app and get the **Admin API access token**

### 2. Install Dependencies

```bash
# Backend
cd web/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Environment Variables

Create `web/backend/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopify-announcement
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
PORT=5000
```

For production frontend, create `web/frontend/.env`:

```env
VITE_API_URL=https://your-backend.onrender.com
```

### 4. Run Locally

```bash
# Terminal 1 - Backend
cd web/backend
npm run dev

# Terminal 2 - Frontend
cd web/frontend
npm run dev
```

Open http://localhost:3000

### 5. Theme App Extension

The extension is in `extensions/announcement-banner/`. To deploy it:

1. Install the [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
2. Run `shopify app deploy` from the project root
3. In your dev store, go to **Online Store → Themes → Customize**
4. Enable the "Announcement Banner" app embed under **App embeds**

## How It Works

1. **Admin types** an announcement message (e.g., "Sale 50% Off!")
2. **Clicks Save** → Backend saves to MongoDB (audit trail) AND updates Shopify Shop Metafield (`my_app.announcement`)
3. **Storefront** → Theme App Extension reads `{{ shop.metafields.my_app.announcement }}` and displays the banner on every page

## Deployment

### Backend (Render.com)
1. New Web Service → connect repo
2. Root directory: `web/backend`
3. Build: `npm install` | Start: `npm start`
4. Add env vars

### Frontend (Render.com / Vercel)
1. New Static Site → connect repo
2. Root directory: `web/frontend`
3. Build: `npm install && npm run build`
4. Publish: `dist`
5. Env: `VITE_API_URL=https://your-backend.onrender.com`
