# WeatherGuard Admin - Secure Weather Alert Service

A secure, invite-only weather alert service with an admin dashboard and Telegram bot integration. Users sign up via social login (Google/GitHub), request access, and once approved by admins, receive automated weather alerts via Telegram.

## 🎯 Features

- **Clerk Authentication**: Social login with Google and GitHub
- **Approval Workflow**: Users submit access requests → Admins review → Users get approved
- **Admin Dashboard**: React-based interface for managing users and alerts
- **Telegram Integration**: Automated weather alert delivery via Telegram Bot
- **Task Scheduling**: Node-cron based alert scheduling system
- **MongoDB Database**: Persistent data storage with optimized schemas
- **Modular NestJS API**: Clean architecture with separated concerns

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React Admin)                    │
│                   Clerk Authentication                      │
└─────────────────────────────────────────────────────────────┘
                              ↓ (API Calls)
┌─────────────────────────────────────────────────────────────┐
│                    NestJS API (Port 3000)                   │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ Auth Module  │ Users Module │ Access Requests Module   │ │
│  ├──────────────┼──────────────┼──────────────────────────┤ │
│  │ Alerts Module│ Telegram Module                          │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓
    ┌────────────┬─────────────┬─────────────┐
    │  MongoDB   │   Clerk     │ Telegram    │
    │  Database  │   Backend   │    Bot      │
    └────────────┴─────────────┴─────────────┘
```

## 🗄️ Database Schema

### Users Collection

```json
{
  "_id": "ObjectId",
  "clerkId": "user_xxx (unique)",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "imageUrl": "https://...",
  "status": "pending | approved | rejected",
  "telegramChatId": "123456789",
  "telegramUsername": "johndoe",
  "notificationsEnabled": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "approvedAt": "2024-01-16T14:20:00Z",
  "rejectionReason": "optional"
}
```

**Indexes:**
- `clerkId` (unique)
- `email` (unique)
- `status`
- `createdAt`

### Access Requests Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "userEmail": "user@example.com",
  "clerkId": "user_xxx",
  "status": "pending | approved | rejected",
  "reasonForAccess": "I want weather alerts for my city",
  "telegramUsername": "johndoe",
  "adminApprovedBy": "admin_xxx (Clerk ID)",
  "approvalNotes": "Approved - looks legit",
  "rejectionReason": "optional",
  "createdAt": "2024-01-15T10:30:00Z",
  "approvedAt": "2024-01-16T14:20:00Z",
  "rejectedAt": "optional",
  "updatedAt": "2024-01-16T14:20:00Z"
}
```

**Indexes:**
- `status`
- `clerkId`
- `createdAt`

### Alerts Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "userClerkId": "user_xxx",
  "title": "Severe Thunderstorm Warning",
  "description": "Severe thunderstorm expected in your area",
  "severity": "warning | alert | critical",
  "location": "San Francisco, CA",
  "temperature": 24,
  "condition": "Thunderstorm",
  "windSpeed": 45,
  "sent": false,
  "sentAt": "optional",
  "scheduledFor": "2024-01-15T12:00:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Indexes:**
- `sent`
- `scheduledFor`
- `userClerkId`
- `createdAt`

## 🚀 Tech Stack

### Backend
- **NestJS** - Modular TypeScript framework
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM
- **Node-cron** - Task scheduling
- **Telegraf** - Telegram Bot API
- **Clerk Backend SDK** - Authentication

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Clerk React** - Authentication
- **Axios** - HTTP client
- **React Router** - Navigation

## 📁 Project Structure

```
weatherguardadmin/
├── api/                          # NestJS Backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/            # Clerk authentication
│   │   │   ├── users/           # User management
│   │   │   ├── access-requests/ # Approval workflow
│   │   │   ├── alerts/          # Alert management
│   │   │   └── telegram/        # Telegram integration
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
│
├── admin/                        # React Dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PendingRequests.tsx
│   │   │   ├── ApprovedUsers.tsx
│   │   │   └── Alerts.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── package.json                 # Monorepo root
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB instance running
- Clerk account and credentials
- Telegram Bot Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SAANVIVERMA05/weatherguardadmin.git
   cd weatherguardadmin
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**

   **API (.env)**
   ```bash
   cp api/.env.example api/.env
   ```
   
   Update `api/.env`:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/weatherguard
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ADMIN_URL=http://localhost:5173
   REDIS_URL=redis://localhost:6379
   ```

   **Admin (.env.local)**
   ```bash
   cp admin/.env.example admin/.env.local
   ```
   
   Update `admin/.env.local`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

5. **Run development servers**
   ```bash
   npm run dev
   ```

   Or run separately:
   ```bash
   npm run api:dev    # Terminal 1
   npm run admin:dev  # Terminal 2
   ```

6. **Access the application**
   - Admin Dashboard: http://localhost:5173
   - API: http://localhost:3000

## 📚 API Endpoints

### Auth Module
- `POST /auth/verify-token` - Verify Clerk token
- `GET /auth/me` - Get current user
- `GET /auth/users` - Get all users (admin)

### Users Module
- `POST /users/register` - Register new user
- `GET /users/profile/:clerkId` - Get user profile
- `GET /users` - Get all users
- `GET /users/pending` - Get pending users
- `GET /users/approved` - Get approved users

### Access Requests Module
- `POST /access-requests/request` - Submit access request
- `GET /access-requests/pending` - Get pending requests (admin)
- `GET /access-requests` - Get all requests (admin)
- `PUT /access-requests/:id/approve` - Approve request (admin)
- `PUT /access-requests/:id/reject` - Reject request (admin)

### Alerts Module
- `POST /alerts/create` - Create new alert (admin)
- `GET /alerts/pending` - Get pending alerts (admin)
- `GET /alerts/user/:clerkId` - Get alerts for user
- `GET /alerts` - Get all alerts (admin)

## 🔄 User Flow

1. **Registration**: User signs up with Google/GitHub via Clerk
2. **Access Request**: User submits access request with Telegram username
3. **Admin Review**: Admin views pending requests in dashboard
4. **Approval**: Admin approves request and adds notes (optional)
5. **Alert Delivery**: System sends weather alerts to approved users via Telegram

## 🤖 Alert Scheduling

- **Pending alerts** are checked every **minute** and sent to approved users
- **Old alerts** (>30 days) are automatically cleaned up **hourly**
- Alerts can be scheduled for future delivery

## 🔐 Security

- Clerk handles all authentication securely
- JWT tokens validated for API endpoints
- Environment variables for sensitive data
- CORS configured for admin dashboard
- MongoDB connection via URI

## 📝 Environment Variables

### API (.env)
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/weatherguard
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
TELEGRAM_BOT_TOKEN=
ADMIN_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
WEATHER_API_KEY=
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

### Admin (.env.local)
```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=http://localhost:3000
```

## 🚀 Deployment

### Docker Support (Coming Soon)
- Dockerfile for API
- Dockerfile for Admin
- Docker Compose setup

### Production Checklist
- [ ] Use production MongoDB instance
- [ ] Set up production Clerk app
- [ ] Configure Telegram bot webhook
- [ ] Set up Redis for BullMQ (optional)
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set NODE_ENV=production
- [ ] Use environment-specific configurations

## 📖 Scripts

```bash
# Development
npm run dev                 # Run both API and Admin
npm run api:dev           # Run API only
npm run admin:dev         # Run Admin only

# Building
npm run build             # Build both
npm run api:build         # Build API
npm run admin:build       # Build Admin

# Production
npm run api:prod          # Run API in production
npm run admin:preview     # Preview built admin

# Installation
npm run install-all       # Install all dependencies
npm run api:install       # Install API deps
npm run admin:install     # Install Admin deps
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@weatherguard.local

## 🔗 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Telegraf Documentation](https://telegraf.js.org)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with ❤️ by WeatherGuard Team**
