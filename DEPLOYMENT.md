# ForgeFit deployment

The app has two services:

- Frontend: Vite/React static site
- Backend: Express API with MongoDB

## 1. Create a MongoDB database

Create a MongoDB Atlas cluster and copy its connection string. Add the database network access rule required by your hosting provider.

## 2. Deploy the backend

Use Render, Railway, or another Node host.

- Root directory: `fitness-backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:

```text
MONGO_URI=your MongoDB Atlas connection string
JWT_SECRET=a long random secret
CLIENT_URL=your deployed frontend URL
PORT=the host-provided port, when required
```

The backend exposes routes under `/api`.

## 3. Deploy the frontend

Use Vercel, Netlify, Render Static Site, or another static host.

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable:

```text
VITE_API_URL=https://your-backend-domain.example.com/api
```

The `VITE_API_URL` value is embedded during the frontend build, so set it before rebuilding after changing the backend URL.

## Local demo fallback

When `MONGO_URI` is not set, the backend uses a temporary MongoDB memory server and seeds demo accounts. That mode is suitable for local exploration only; hosted deployments must use persistent MongoDB.

Demo accounts:

- Admin: `admin@forgefit.com` / `admin123`
- Client: `client@forgefit.com` / `client123`
