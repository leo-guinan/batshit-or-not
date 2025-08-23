# 🦇 Batshit or Not

A community-driven platform where users submit their wildest ideas and have them rated by the crowd on a "batshit crazy" scale from 1-10.

![Batshit or Not Logo](attached_assets/ChatGPT%20Image%20Aug%2022,%202025,%2004_28_34%20PM_1755895253186.png)

## 🚀 Features

- **Idea Submission**: Share your craziest ideas with the community (280-1000 characters)
- **Rating System**: Rate ideas on a scale of 1-10 from "Boringly Sane" to "Absolutely Batshit"
- **Discovery Feeds**: 
  - Fresh: Newly submitted ideas
  - Trending: Most rated in the last 24 hours
  - Hall of Fame: Highest rated ideas of all time
- **User Profiles**: Track your submitted ideas, ratings, and "Batshit Score"
- **Social Features**: Connect with friends and compare rating styles
- **Anonymous Posting**: Option to submit ideas anonymously

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript, TanStack Query, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Local auth with bcrypt and express-session
- **Build Tools**: Vite, ESBuild

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (optional for development)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/BatshitOrNot.git
cd BatshitOrNot
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database connection (optional for development)
DATABASE_URL=postgresql://username:password@localhost:5432/batshit_or_not

# Session secret (generate a secure random string for production)
SESSION_SECRET=your-secret-key-here-change-in-production

# Environment
NODE_ENV=development

# Server port
PORT=5000
```

**Note**: If you don't provide a `DATABASE_URL`, the app will run with an in-memory mock database (data won't persist between restarts).

4. **Database setup (if using a real database)**

If you have PostgreSQL set up with a `DATABASE_URL`:

```bash
npm run db:push
```

This will create all necessary tables in your database.

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## 🎮 Usage

### Creating an Account

1. Navigate to the app homepage
2. Click on the "Register" tab
3. Enter your details:
   - **Username**: 3-20 characters (letters, numbers, underscores only)
   - **Email**: Valid email address
   - **Password**: Minimum 6 characters
   - **First/Last Name**: Optional

### Logging In

1. Use your username and password to log in
2. Sessions persist for 7 days

### Submitting Ideas

1. Click the floating "+" button or "Submit Idea" button
2. Enter your idea (10-1000 characters)
3. Select a category (Technology, Business, Lifestyle, Science, Art, Social, Other)
4. Choose whether to post anonymously
5. Submit!

### Rating Ideas

Ideas can be rated with three quick options:
- 🟢 **SANE** (3/10): Pretty normal idea
- 🟠 **CONFUSING** (6/10): Wait... what now?
- 🔴 **BATSHIT** (10/10): Absolutely unhinged!

### Viewing Your Profile

- Click the profile icon in the navigation
- View your stats:
  - Ideas submitted
  - Average rating received
  - Total ratings given
  - Batshit Score
  - Achievements

### Connecting with Friends

1. Search for users in the profile page
2. Send friend requests
3. Compare your rating style with friends and the global average

## 📁 Project Structure

```
BatshitOrNot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and helpers
│   └── index.html
├── server/                # Express backend
│   ├── auth.ts           # Authentication logic
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── index.ts          # Server entry point
├── shared/               # Shared TypeScript types
│   └── schema.ts        # Database schema and types
├── package.json
└── README.md
```

## 🔒 Security

- Passwords are hashed using bcrypt with salt rounds
- Sessions are stored server-side
- HTTP-only cookies for session management
- Input validation on both client and server
- SQL injection protection via parameterized queries

## 🐛 Development Without Database

The app includes a mock storage system for development without PostgreSQL:

1. Simply don't set `DATABASE_URL` in your environment
2. Run `npm run dev`
3. The app will use in-memory storage (data resets on restart)

This is perfect for:
- Quick testing and development
- Running the app without database setup
- CI/CD environments

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `GET /api/auth/user` - Get current user

### Ideas
- `GET /api/ideas` - List ideas (with filters)
- `POST /api/ideas` - Submit new idea
- `GET /api/ideas/:id` - Get specific idea

### Ratings
- `POST /api/ratings` - Rate an idea
- `GET /api/ratings/check/:ideaId` - Check if user rated an idea
- `GET /api/ratings/comparison` - Get rating comparisons

### Social
- `GET /api/friendships` - Get friends list
- `POST /api/friendships/request` - Send friend request
- `GET /api/friendships/pending` - Get pending requests
- `DELETE /api/friendships/:friendId` - Remove friend

## 🎨 Brand Guidelines

The app features a playful, energetic design with:
- **Primary Color**: Batshit Orange (#F39C3C)
- **Mascot**: Batty - a wide-eyed, tongue-wagging bat
- **Tone**: Playfully unhinged, irreverently smart

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with React, Express, and PostgreSQL
- UI components from Radix UI and Tailwind CSS
- Icons from Lucide React

---

**Remember**: The best ideas are the ones that make people go "that's either brilliant or completely insane!" 🦇