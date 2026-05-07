# CryptoSkope

CryptoSkope is a premier, high-performance cryptocurrency intelligence platform built on **Next.js 14**. It provides real-time on-chain analytics, market sentiment monitoring, and advanced whale tracking for the **Theta Network** ecosystem.

## 🚀 Key Features

- **Real-Time On-Chain Tracking**: Direct integration with the Theta Network via `ethers.js` for sub-second block event monitoring.
- **Institutional-Grade Analytics**: Advanced market data visualization using **Recharts** and **Chart.js**.
- **Whale Alert System**: Proactive monitoring of large-scale transfers and liquidity movements.
- **Fear & Greed Integration**: Real-time market sentiment analysis via the Alternative.me API.
- **Enterprise-Ready Portfolio Tracker**: Professional wallet tracking with USD valuations and performance metrics.
- **Ultra-Responsive UI**: Immersive dark-themed interface built with **Tailwind CSS**, **shadcn/ui**, and **Framer Motion**.
- **Data Integrity**: Robust state management and caching powered by **TanStack Query**.

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Web3 Engine**: ethers.js, @thetalabs/theta-js
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS, lucide-react, framer-motion
- **Components**: shadcn/ui

## 📦 Getting Started

### Step 1: Set up environment
```bash
cd CryptoSkope
cp .env.example .env.local
# Edit .env.local — add your real keys
```

### Step 2: Install and run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## 🗂 Project Structure

```text
/app             → Next.js App Router (Pages, Layouts, API Routes)
/components      → Professional UI components and layout elements
/hooks           → Specialized React hooks for wallet and state management
/lib             → Core services, context providers, and utility functions
/public          → High-resolution assets and static files
/types           → TypeScript definitions and global type declarations
```

## 🔐 Environment Configuration

The application requires several API keys for full functionality. Ensure your `.env.local` contains the following:

```env
COINGECKO_PRO_API_KEY=your_pro_key_here
COINGECKO_API_KEY=your_free_key_here
NEWS_API_KEY=your_newsdata_key_here
```

## 🧪 Quality Assurance

```bash
npm run test
```

## 📄 License

This project is licensed under the MIT License.
