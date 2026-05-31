# TaskFlow - Full-Stack Task Management System
TaskFlow is a task management application where users can organize their task, track progress, manage deadlines, receive notifications, and handle their work from a personal dashboard

## 🚀 Features

### Authentication & Authorization
- User registration and login with JWT authentication
- Password reset functionality with email verification
- Role-based access control (Admin/User)
- Secure password hashing with bcrypt

### Task Management
- Create, read, update, and delete todos
- Task categorization and priority levels
- Due date tracking with calendar picker
- Task completion status
- Bulk operations (clear completed tasks)
- Rich text descriptions

### User Management
- User profile management
- Admin dashboard for user administration
- User activity tracking
- Customizable notification preferences

### Notifications
- Real-time notification system
- Multiple notification types:
  - Task assignments
  - Task updates
  - Task completions
  - Comments
- In-app notification bell
- Email notifications with custom MJML templates

### Dashboard
- Personalized user dashboard
- Task overview and statistics
- Admin panel for system management
- Responsive sidebar navigation

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** MySQL with Prisma ORM
- **UI Components:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS 4
- **Forms:** React Hook Form + Zod validation
- **Authentication:** JWT (jsonwebtoken)
- **Email:** Nodemailer + MJML templates
- **Icons:** Lucide React
- **Notifications:** Sonner (toast notifications)

## 📋 Prerequisites

- Node.js 20+ 
- MySQL database
- npm/yarn/pnpm/bun package manager

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Email (SMTP)
EMAIL_USER="xyz.@example.com"
EMAIL_PASS=Password

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Getting Started

First, install dependencies:

```bash
npm install
```

Set up the database:

```bash
npx prisma generate
npx prisma migrate deploy
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📁 Project Structure

```
todo-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Auth endpoints
│   │   │   ├── todo/         # Todo CRUD endpoints
│   │   │   └── dashboard/    # Dashboard endpoints
│   │   └── dashboard/        # Protected dashboard pages
│   ├── components/           # React components
│   │   └── ui/              # shadcn/ui components
│   ├── controllers/          # Business logic controllers
│   ├── services/            # Data access layer
│   ├── validations/         # Zod schemas
│   ├── lib/                 # Utilities and helpers
│   └── hooks/               # Custom React hooks
└── generated/prisma/        # Generated Prisma client
```

## 🔑 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Todos
- `GET /api/todo` - Get all todos (with filters)
- `POST /api/todo` - Create a new todo
- `GET /api/todo/[id]` - Get a specific todo
- `PUT /api/todo/[id]` - Update a todo
- `DELETE /api/todo/[id]` - Delete a todo
- `DELETE /api/todo/clear-completed` - Clear completed todos

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## 📦 Database Models

- **User** - User accounts with role-based permissions
- **Todo** - Tasks with priority, category, and due dates
- **Notification** - System notifications for task activities

## 🎨 UI Components

Built with shadcn/ui, including:
- Buttons, Inputs, Selects, Textareas
- Dialogs, Alerts, Popovers
- Calendar, Date Picker
- Sidebar, Navigation
- Data tables and cards
- Loading states and skeletons

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
