# EquiRent — Rent Smart. Work Better.

> **Peer-to-Peer Heavy & Industrial Equipment Rental Marketplace**

EquiRent is a modern, responsive full-stack web application designed for commercial contractors, farmers, and project builders to connect with machinery fleet owners. The platform allows owners to monetize dormant machinery while enabling renters to discover, calculate, and book verified equipment without high capital ownership costs.

---

## 🚀 Key Features

### 1. Public Marketplace & Landing Page
- **Hero Showcase:** "Access Equipment. Without the Ownership Cost."
- **Live Search & Filter Bar:** Instant lookup by equipment title, category, and geographical location.
- **Machinery Catalogs:**
  - Agricultural Machinery (Tractors, Combines, Tillers)
  - Construction Machinery (Excavators, Skid Steers, Boom Lifts)
  - Industrial Equipment (Silent Diesel Generators, Forklifts, Compressors)
  - Power Tools (Demolition Breakers, Concrete Cutters, Core Drills)
  - Event Equipment (Line Array Sound Systems, Staging Tents, Quiet Power)
- **Trust & Safety Guarantee:** Identity verification, condition checklists, and simulated escrow protection.

### 2. Dual-Role Authentication
- **Role-Aware Workflows:** Separate capabilities for **Renters** and **Equipment Fleet Owners** (or Dual Role).
- **Fast Evaluation One-Click Logins:** Instant demo switcher for evaluation:
  - **Demo Renter:** `renter@equirent.com` (Marcus Vance)
  - **Demo Owner:** `owner@equirent.com` (Sarah Jenkins, Apex Machinery)
  - **Dual Role:** `alex@equirent.com` (Alex Rivera)
  - Default Demo Password: `password123`
- Secure **bcrypt** password hashing and **JWT** session tokens.

### 3. Equipment Discovery & Interactive Booking Calculator
- **Explore Page:** Multi-parameter filtering by category, location, availability, and min/max daily rental price.
- **Sorting Options:** Price (low-to-high, high-to-low), newest listings, and operator ratings.
- **Dynamic Booking Calculator:**
  - Date range selector with validation (disallows past dates and end dates prior to start dates).
  - Real-time calculation: `(Daily Rate × Days) + Refundable Security Deposit + 10% Platform Fee = Total Estimated Cost`.
  - Collision detection to prevent overlapping bookings on the same machinery.

### 4. Fleet Management & Live Listing Preview
- Add, update, and remove machinery listings.
- **Live Interactive Card Preview:** Equipment owners can view how their listing card will look on the marketplace in real-time as they type.
- Dynamic technical specification key-value builder.

### 5. Booking Workflow State-Machine
- Complete lifecycle management:
  $$\text{Pending} \longrightarrow \text{Confirmed} \longrightarrow \text{Active} \longrightarrow \text{Completed}$$
  (or $\text{Cancelled}$)
- Owners can **Accept** or **Reject** incoming booking requests.
- Renters can cancel pending reservations with simulated instant escrow refunding.
- Printable booking confirmation slips with comprehensive financial line-item breakdowns.

### 6. Earnings & Financial Analytics
- **KPI Metrics:** Gross Rental Turnover, Net Owner Payouts (90%), Platform Fees (10%), and Escrow Balances.
- **Chart.js Analytics:** Interactive monthly revenue curves and booking status distribution doughnut chart.
- **Real CSV Export:** Server-generated downloadable `.csv` report (`/api/earnings/export-csv`) with full line-item auditing.

### 7. Direct Messaging & Real-Time Alerts
- 2-column communication interface between renters and owners.
- Unread badge counters and notification center.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Modern Custom Property Design System), Vanilla JavaScript (Single-Page Hash Routing Architecture).
- **Backend:** Node.js & Express.js.
- **Icons:** Lucide Icons.
- **Charts:** Chart.js 4.4.
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`.
- **Database Architecture (Dual-Engine):**
  - **Primary:** MongoDB with Mongoose (when `MONGODB_URI` is available).
  - **Persistent Fallback Engine:** Automatic disk-persistent JSON storage in `data/db.json` with seed synchronization, ensuring the application runs out of the box on any system with zero database setup required.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd Projects
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure environment variables in `.env` (default template provided):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/equirent
   JWT_SECRET=equirent_development_jwt_secret_key_change_in_production
   COMMISSION_RATE=0.10
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

---

## 🔍 Distinction: Functional vs. Simulated Features

| Feature | Implementation Status | Notes |
|---|---|---|
| **User Authentication** | **Full Backend Implementation** | Real bcrypt hashing, JWT token verification, route guards. |
| **Machinery Listings CRUD** | **Full Backend Implementation** | Persistent across restarts in `data/db.json` or MongoDB. |
| **Booking State Machine** | **Full Backend Implementation** | Date overlap checking, live recalculation, status transitions. |
| **CSV Financial Export** | **Full Backend Implementation** | Dynamically generated CSV file stream downloaded to device. |
| **Direct Messaging** | **Full Backend Implementation** | Thread storage and simulated immediate owner responses. |
| **Payment Gateway** | **Simulated Escrow** | Clearly labeled as simulated escrow for demonstration without requiring real credit cards or merchant accounts. |
| **Platform Commission** | **Configurable Illustrative 10%** | Configurable via `COMMISSION_RATE` in `.env`. |

---

## 📄 License
MIT License &copy; 2026 EquiRent Technologies.
