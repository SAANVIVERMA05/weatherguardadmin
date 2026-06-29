# WeatherGuard Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js >= 18
- MongoDB running
- Clerk account
- Telegram bot token

### 2. Environment Setup

**Step 1: Create API environment file**
```bash
cp api/.env.example api/.env
```

Edit `api/.env`:
```env
PORT=3000
MONGODB_URI=mongodb://admin:password@localhost:27017/weatherguard?authSource=admin
CLERK_SECRET_KEY=sk_test_... # From Clerk dashboard
CLERK_PUBLISHABLE_KEY=pk_test_... # From Clerk dashboard
TELEGRAM_BOT_TOKEN=... # From Telegram BotFather
ADMIN_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

**Step 2: Create Admin environment file**
```bash
cp admin/.env.example admin/.env.local
```

Edit `admin/.env.local`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... # Same as API
```

### 3. Start Services

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Manual Setup**
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Redis
redis-server
```

### 4. Install Dependencies
```bash
npm run install-all
```

### 5. Run Development Servers

**Option A: Both services together**
```bash
npm run dev
```

**Option B: Separately**
```bash
# Terminal 1
npm run api:dev

# Terminal 2
npm run admin:dev
```

### 6. Access Dashboard
- Admin: http://localhost:5173
- API: http://localhost:3000
- Health: http://localhost:3000/health

## 🔑 Getting Clerk Credentials

1. Go to https://dashboard.clerk.com
2. Create a new application
3. Choose "Google" and/or "GitHub" as social providers
4. Copy your keys:
   - Publishable Key (VITE_CLERK_PUBLISHABLE_KEY)
   - Secret Key (CLERK_SECRET_KEY)

## 🤖 Getting Telegram Bot Token

1. Open Telegram and find @BotFather
2. Send `/newbot` command
3. Follow instructions to create bot
4. Copy the token to TELEGRAM_BOT_TOKEN

## 📊 MongoDB Collections

Collections will be created automatically on first run:
- `users`
- `accessrequests`
- `alerts`

## 🧪 Testing the Flow

1. **Sign Up**: Go to admin dashboard, click "Sign up"
2. **Create User**: Use Google/GitHub sign-in
3. **Submit Request**: Fill access request form
4. **Admin Approval**: Go to "Pending Requests", click "Review Request", then "Approve"
5. **Send Alert**: Navigate to "Alerts", click "Create Alert"
6. **Check Telegram**: Alert should be sent (if Telegram bot configured)

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
```bash
docker-compose up mongodb -d
```

### Clerk Authentication Error
```
Missing Publishable Key
```
**Solution**: Check VITE_CLERK_PUBLISHABLE_KEY in admin/.env.local

### Telegram Bot Not Sending
```
Telegram bot not initialized
```
**Solution**: Verify TELEGRAM_BOT_TOKEN in api/.env

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution**: Change PORT in api/.env or kill existing process

## 📚 API Response Examples

### Create Access Request
```bash
curl -X POST http://localhost:3000/access-requests/request \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "userEmail": "user@example.com",
    "clerkId": "user_abc123",
    "reasonForAccess": "Personal weather alerts",
    "telegramUsername": "johndoe"
  }'
```

### Approve Request
```bash
curl -X PUT http://localhost:3000/access-requests/507f1f77bcf86cd799439011/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "adminClerkId": "admin_xyz789",
    "approvalNotes": "Welcome aboard!"
  }'
```

### Create Alert
```bash
curl -X POST http://localhost:3000/alerts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "userClerkId": "user_abc123",
    "title": "Storm Warning",
    "description": "Severe storm approaching",
    "severity": "critical",
    "location": "New York, NY"
  }'
```

## 📝 Project Structure Review

```
api/
├── src/modules/
│   ├── auth/           # ✅ Clerk integration
│   ├── users/          # ✅ User management
│   ├── access-requests/# ✅ Approval workflow
│   ├── alerts/         # ✅ Alert scheduling
│   └── telegram/       # ✅ Bot integration
└── [config files]

admin/
├── src/pages/
│   ├── Dashboard.tsx        # ✅ Stats overview
│   ├── PendingRequests.tsx  # ✅ Approval interface
│   ├── ApprovedUsers.tsx    # ✅ User management
│   └── Alerts.tsx           # ✅ Alert creation
└── [config files]
```

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Environment
Update `.env` and `.env.local` with production values:
- Production MongoDB connection string
- Production Clerk app credentials
- Production Telegram bot token
- Production API URL

### Deploy API
```bash
npm run api:prod
```

### Deploy Admin
```bash
npm run admin:build
# Upload dist/ to your hosting
```

## 📞 Next Steps

1. **Customize**: Modify dashboard UI/colors in Tailwind config
2. **Add Weather API**: Integrate real weather data API
3. **Scale Database**: Add proper indexing and optimization
4. **Enable BullMQ**: Replace node-cron for better scheduling
5. **Setup CI/CD**: Add GitHub Actions for automated testing
6. **Documentation**: Add API docs with Swagger/OpenAPI

## ✅ Checklist Before Going Live

- [ ] All environment variables set
- [ ] Clerk social providers configured
- [ ] Telegram bot created and token set
- [ ] MongoDB backup configured
- [ ] Redis for BullMQ setup (optional)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting added
- [ ] Error logging setup
- [ ] Monitoring configured

---

**Ready to deploy? Good luck! 🚀**
