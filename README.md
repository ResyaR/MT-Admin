# MT Trans - Admin Panel

> **⚠️ SECURITY NOTE**: This is a separate admin panel for MT Trans food delivery platform. Keep this repository private and deploy separately from the main user-facing application.

## 🔒 Project Separation

This admin panel is intentionally separated from the main user application (`food-delivery-app`) for security reasons:

- **Different Repository**: Admin and user apps should be in different repos
- **Different Deployment**: Deploy on different domains/subdomains
- **Different Port**: Runs on port 3001 (user app on 3000)
- **No User Dependencies**: No shared authentication context with user app

## 📋 Features

- ✅ **Secure Admin Authentication** with admin key
- ✅ **Real-time Data** from backend API
- ✅ **Users Management** - View, search, filter users
- ✅ **Orders Management** - Track and manage all orders
- ✅ **Deliveries Tracking** - Monitor active deliveries
- ✅ **Restaurants Management** - Manage partner restaurants
- ✅ **Analytics Dashboard** - Performance metrics and insights
- ✅ **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Access

- **Development**: http://localhost:3001
- **Login Page**: http://localhost:3001/login
- **Admin Key**: `resya123@`

## 🔑 Authentication

The admin panel uses a simple admin key authentication:

- **Admin Key**: `resya123@` (defined in `lib/adminApi.ts`)
- **Storage**: LocalStorage key `admin_authenticated`
- **No User Account**: Admin doesn't need separate user registration

### How to Login

1. Navigate to `/login`
2. Enter admin key: `resya123@`
3. Click "Access Admin Panel"
4. You'll be redirected to dashboard with full access

### How to Change Admin Key

Edit `lib/adminApi.ts`:

```typescript
const ADMIN_KEY = 'your-new-secure-key-here@';
```

Also update in backend: `backend/src/admin/admin.controller.ts` line 29

## 📁 Project Structure

```
food-delivery-admin/
├── app/                      # Next.js App Router pages
│   ├── page.jsx             # Dashboard (/)
│   ├── login/page.jsx       # Login page
│   ├── users/page.jsx       # Users management
│   ├── orders/page.jsx      # Orders management
│   ├── deliveries/page.jsx  # Deliveries tracking
│   ├── restaurants/page.jsx # Restaurants management
│   ├── analytics/page.jsx   # Analytics & reports
│   ├── layout.jsx           # Root layout with sidebar
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── AdminGuard.jsx      # Auth guard
│   ├── AdminHeader.jsx     # Top header
│   ├── AdminSidebar.jsx    # Side navigation
│   ├── AdminDashboard.jsx  # Main dashboard
│   ├── UsersTable.jsx      # Users table with API
│   ├── OrdersTable.jsx     # Orders table with API
│   ├── DeliveriesTable.jsx # Deliveries table with API
│   └── ...                 # Other components
├── lib/                     # Utilities
│   ├── adminApi.ts         # Admin API service
│   └── config.ts           # API configuration
├── public/                  # Static assets
├── package.json
└── README.md
```

## 🔌 API Integration

All data is fetched from backend API. No hardcoded data!

### Backend Endpoints Used

#### Users
```javascript
POST /users/admin/all
Body: { adminToken: "resya123@" }
```

#### Deliveries
```javascript
GET /delivery/pending
Headers: { Authorization: "Bearer {token}" }
```

#### Drivers
```javascript
GET /drivers
Headers: { Authorization: "Bearer {token}" }
```

#### Admin Operations
```javascript
DELETE /admin/users
Headers: { "admin-key": "resya123@" }
```

### API Configuration

Edit `lib/config.ts`:

```typescript
export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:4000',
  },
  production: {
    baseURL: 'https://be-mt-trans.vercel.app',
  }
};
```

## 🎨 Customization

### Branding Colors

Edit in `app/globals.css`:

```css
:root {
  --brand-red: #E50000;
  --brand-red-dark: #B70000;
}
```

### Logo

Replace `/public/logo.png` with your logo

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables

No environment variables needed! API URL is configured in `lib/config.ts`

### Security Checklist

- [ ] Change default admin key from `resya123@`
- [ ] Deploy on separate domain from user app
- [ ] Use HTTPS in production
- [ ] Implement IP whitelist (optional)
- [ ] Enable rate limiting
- [ ] Regular security audits

## 📊 Available Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | Admin authentication |
| Dashboard | `/` | Statistics & overview |
| Users | `/users` | User management |
| Orders | `/orders` | Orders tracking |
| Deliveries | `/deliveries` | Active deliveries |
| Restaurants | `/restaurants` | Partner restaurants |
| Analytics | `/analytics` | Reports & metrics |

## 🔧 Development

### Port Configuration

Admin runs on **port 3001** (user app on 3000):

```json
// package.json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "start": "next start -p 3001"
  }
}
```

### Hot Reload

All changes are reflected immediately during development.

## 📝 Important Notes

1. **Separate Deployment**: Never deploy admin and user app together
2. **Different Domain**: Use admin.yourdomain.com or admin-yourdomain.com
3. **Private Repository**: Keep this repo private on GitHub
4. **Change Admin Key**: Always change the default admin key in production
5. **Backend Sync**: Admin key must match between frontend and backend

## 🆘 Troubleshooting

### Cannot Login
- Check admin key is correct: `resya123@`
- Clear localStorage and try again
- Check browser console for errors

### Data Not Loading
- Check backend API is running
- Verify API_BASE_URL in `lib/config.ts`
- Check network tab for failed requests

### Redirect Loop
- Clear localStorage
- Go to `/login` directly
- Re-login with admin key

## 📞 Support

For issues or questions:
- Check backend API status
- Review browser console errors
- Check network requests in DevTools

## 📄 License

Private - MT Trans Admin Panel

