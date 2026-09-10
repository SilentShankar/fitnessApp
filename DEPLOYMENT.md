# ForgeFit deployment

The app has two services:

- Frontend: Vite/React static site
- Backend: Express API with MongoDB

## Recommended: deploy with Render

The repository includes a [`render.yaml`](render.yaml) Blueprint for the frontend and backend.

1. Push the repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Enter values for `MONGO_URI` and `JWT_SECRET` when Render prompts for them.
4. Deploy the Blueprint. The frontend is served at `forgefit-web.onrender.com` and the API at `forgefit-api.onrender.com`.

Use a custom domain by updating `CLIENT_URL` on `forgefit-api` and `VITE_API_URL` on `forgefit-web`, then redeploying the frontend.

## Manual deployment

### 1. Create a MongoDB database

Create a MongoDB Atlas cluster and copy its connection string. Add the database network access rule required by your hosting provider.

For Render, allow the provider's outbound access in Atlas Network Access. A temporary `0.0.0.0/0` rule is simplest for initial setup, but restrict it when your hosting provider offers stable outbound IPs.

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

For SPA routing, configure the static host to rewrite every path to `/index.html`. The included Render Blueprint already does this.

## Local demo fallback

When `MONGO_URI` is not set, the backend uses a temporary MongoDB memory server and seeds demo accounts. That mode is suitable for local exploration only; hosted deployments must use persistent MongoDB and a real `JWT_SECRET`.

Demo accounts:

- Admin: `admin@forgefit.com` / `admin123`
- Client: `client@forgefit.com` / `client123`
