# SEO Rank Tracker

An end-to-end SEO Rank Tracking application that enables users to monitor keyword rankings, analyze search performance, and visualize ranking trends through an interactive dashboard. The project provides secure user authentication, keyword management, automated rank tracking, and historical performance reports to help businesses improve their search engine visibility.

---

## Features

- User Authentication (Login & Registration)
- Keyword Rank Tracking
- Automated Rank Refresh
- Historical Ranking Analysis
- Interactive Dashboard
- Ranking Trend Visualization
- Performance Reports
- Protected Routes
- Responsive UI
- MongoDB Database Integration

---

## Tech Stack

### Frontend
- React.js
- TypeScript
- Context API
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Services
- Keyword Tracking Service
- Rank Tracking Service

---

## Project Structure

```
SEO-rank-tracker/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── App.tsx
│
└── package.json
```

---

## Core Modules

### Authentication
- User Registration
- Secure Login
- JWT-based Authorization

### Rank Tracking
- Add keywords
- Track rankings
- Refresh ranking positions
- Store ranking history

### Dashboard
- Overview of tracked keywords
- Ranking statistics
- Performance insights
- Historical reports

---

## Workflow

1. User signs in.
2. Add keywords and target domain.
3. System tracks keyword rankings.
4. Rankings are stored in the database.
5. Dashboard displays current rankings and historical trends.
6. Users can refresh rankings anytime.

---

## Key Components

- Authentication Controller
- Rank Controller
- Keyword Tracking Service
- Rank Tracker Service
- Dashboard
- Rank Details
- History
- Reports

---

## Future Improvements

- Google Search Console Integration
- AI-powered SEO Recommendations
- Email Alerts for Ranking Changes
- Competitor Rank Tracking
- CSV/PDF Report Export
- Scheduled Background Tracking
- Multi-user Team Workspace

---

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/SEO-rank-tracker.git
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file and configure:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

BROWSERBASE_API_KEY=your_browserbase_key
```

---

## Learning Outcomes

- Full Stack Development
- REST API Development
- Authentication & Authorization
- MongoDB Data Modeling
- SEO Analytics
- State Management
- API Integration
- Dashboard Development
- Performance Monitoring

---

## Author

**Kallol Roy**

GitHub: https://github.com/Roy253

LinkedIn: https://linkedin.com/in/kallol-roy-83b227289
