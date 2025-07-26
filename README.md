# 🚀 Codash – Track Your Coding Journey

Codash is a full-stack web app built with **Next.js**, **MongoDB**, and **Zustand**, designed to help developers **track, analyze, and visualize their coding progress** across platforms like **LeetCode**, **Codeforces**, **CodeChef**, and **HackerRank** — all in one unified dashboard.

![Codash Banner](https://your-image-url.com/banner.png) <!-- Optional hero image -->

---

## 🧠 Features

- 📊 **Dashboard View** – View your coding stats and visualizations at a glance
- ⚙️ **Custom Auth System** – Secure signup/login with OTP verification
- 🧾 **Platform Integration** – Connect with LeetCode, Codeforces, etc.
- 💡 **AI-Powered Insights** – Get personalized suggestions based on your coding activity (via OpenAI)
- 🧠 **Zustand for State Management** – Lightweight and scalable
- 🌙 **Dark Mode Friendly UI** – Clean and responsive UI built with TailwindCSS
- 🔐 **JWT Auth with Expiry Handling** – Tokens stored securely with session expiration logic

---

## 🧱 Tech Stack

| Tech        | Description                            |
|-------------|----------------------------------------|
| Next.js     | Full-stack React framework             |
| MongoDB     | NoSQL database via Mongoose            |
| TailwindCSS | Utility-first CSS for rapid UI         |
| Zustand     | Global state management                |
| JWT         | Authentication and authorization       |
| OpenAI API  | Personalized coding insights           |

---

## 🖥️ Screenshots

> Add your own screenshots below:

| Login Page        | Dashboard View     |
|-------------------|--------------------|
| ![Login](https://your-image-url.com/login.png) | ![Dashboard](https://your-image-url.com/dashboard.png) |

---

## 📦 Setup & Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/codash.git
cd codash

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in the necessary API keys and DB URIs

# 4. Start development server
npm run dev

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
BASE_URL=http://localhost:3000

codash/
├── app/                 # Next.js app router
│   └── dashboard/       # Protected routes
├── components/          # Reusable UI components
├── lib/                 # Utility functions
├── store/               # Zustand stores
├── models/              # Mongoose schemas
├── api/                 # Backend API endpoints
├── public/              # Static assets
└── styles/              # Global CSS

### ✅ Optional Enhancements

- Add shields (badges): [shields.io](https://shields.io)
- Add GIF demos or video walkthrough
- Add a changelog section if you're actively iterating

Would you like this README generated as a markdown file or hosted preview link?