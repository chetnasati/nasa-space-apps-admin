# NASA Space Apps Challenge 2026 - BIAS Bhimtal
### Official Event Website, Team Registration System, ID Badge Generator & Admin Command Portal

![NASA Space Apps 2026](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop)

---

## 🚀 Overview

This repository contains the complete production-ready source code for the **NASA Space Apps Challenge 2026** platform hosted at **Birla Institute of Applied Sciences (BIAS), Bhimtal** in collaboration with **Astroverse**.

The platform provides a futuristic, high-performance, national-level hackathon website featuring:
- **Public Landing Page** with event details, mission tracks, interactive photo/video galleries, countdown timer, and FAQs.
- **6-Step Team Registration Wizard** with real-time field validation, input sanitization, rate limiting, and cross-team duplicate detection.
- **Registration Success & Pass Center** providing instant downloadable sci-fi digital security ID passes for each team member and mentor.
- **QR Code Verification Engine** allowing event organizers and security volunteers to instantly authenticate badges via QR lookup or URL parameters.
- **Protected Admin Command Dashboard** equipped with live statistics, full team management, record editing modals, ID pass reissuance, CSV/Excel export engines, and an interactive REST API console.

---

## 📁 Repository Structure

```
nasa-space-apps-admin/
├── index.html              # Main HTML5 entry point & SPA container
├── schema.sql              # Production PostgreSQL / Supabase SQL DDL Schema
├── README.md               # Complete System Documentation & Setup Guide
├── css/
│   ├── styles.css          # Core CSS Design System, Glassmorphic tokens & typography
│   └── components.css      # Custom UI components, wizard, cards, tables & badges
└── js/
    ├── app.js              # Single Page Application controller & view router
    ├── data.js             # Initial state, event details, gallery & FAQ content
    ├── zodValidation.js    # Zod schema validation, sanitization & duplicate detection
    ├── idCardGenerator.js  # Canvas 2D ID Badge rendering & PNG exporter
    ├── exportUtils.js      # CSV and Excel (.xls HTML) exporter engine
    └── mockApi.js          # Simulated REST API handlers & token bucket rate limiter
```

---

## 🗄️ Database Design (Supabase / PostgreSQL Schema)

The database schema is designed in standard SQL for Supabase or any PostgreSQL instance (`schema.sql`):

### 1. `teams` Table
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique Registration ID (e.g. `NASA2026-BIAS-0042`) |
| `team_name` | `VARCHAR(100)` | `NOT NULL` | Team Name |
| `institution_name` | `VARCHAR(150)` | `NOT NULL` | Institution / School / University |
| `category` | `VARCHAR(20)` | `CHECK ('School', 'College')` | Participation Division |
| `team_size` | `INT` | `CHECK (BETWEEN 4 AND 6)` | Total team members count |
| `challenge` | `VARCHAR(150)` | Optional | Assigned NASA Challenge Track |
| `status` | `VARCHAR(20)` | `CHECK ('Approved', 'Pending', 'Flagged')` | Approval Status |
| `is_duplicate` | `BOOLEAN` | `DEFAULT FALSE` | Duplicate audit flag |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Registration Timestamp |

### 2. `participants` Table
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing participant ID |
| `team_id` | `VARCHAR(50)` | `REFERENCES teams(id) ON DELETE CASCADE` | Associated Team ID |
| `name` | `VARCHAR(100)` | `NOT NULL` | Full Name of Participant |
| `email` | `VARCHAR(100)` | `UNIQUE, NOT NULL` | Email Address |
| `mobile` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | 10-Digit Mobile Phone Number |
| `is_leader` | `BOOLEAN` | `DEFAULT FALSE` | Flag indicating Team Leader |
| `role` | `VARCHAR(50)` | Optional | Hackathon Role (e.g. Developer, Designer) |

### 3. `mentors` Table
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing mentor ID |
| `team_id` | `VARCHAR(50)` | `REFERENCES teams(id) ON DELETE CASCADE` | Associated Team ID |
| `name` | `VARCHAR(100)` | `NOT NULL` | Full Name of Faculty Mentor |
| `email` | `VARCHAR(100)` | Optional | Mentor Email |
| `mobile` | `VARCHAR(20)` | Optional | Mentor Mobile Number |

---

## 🔒 Security & Validation System

1. **Zod Validation & Sanitization**:
   - Strictly validates email format, 10-digit mobile numbers, team size limits (4 to 6), and institution name compliance.
   - All text fields pass through HTML entity escaping and script strip sanitization to neutralize XSS attacks.
2. **Cross-Database Duplicate Prevention**:
   - Before registering a new team, all provided emails and mobile numbers (leader, members, mentor) are cross-checked against existing database records.
   - If an email or phone number is already registered under another team, the system blocks registration and reports the specific colliding team.
3. **Token Bucket Rate Limiting**:
   - Limits client requests to a maximum of 5 registrations per minute per IP address, responding with standard `HTTP 429 Too Many Requests`.

---

## 🪪 ID Badge Generation & QR Verification

- **Canvas 2D Rendering**: Generates high-definition (600x900) futuristic NASA ID Cards featuring:
  - Official NASA Vector Emblem & Event Header
  - Holographic `VERIFIED PASS` Seal
  - Dynamic Avatar with Participant Initials
  - Member Name, Role, Team Name & Category Badge (School vs College Division)
  - Venue Details: BIAS Bhimtal (14–15 Nov 2026)
  - Registration ID & Custom QR Code Payload (`/verify?id=NASA2026-BIAS-0042`)
- **Immediate Downloads**: Students and mentors can download individual PNG badges directly after registration.
- **Admin Reissuance**: Admins can regenerate and download any pass at any time.

---

## ⚡ REST API Specifications

The system exposes standard REST API handlers (`js/mockApi.js`):

### 1. Create Registration
- **Endpoint**: `POST /registration`
- **Response**: `201 Created`
```json
{
  "status": 201,
  "message": "Registration successful!",
  "data": {
    "id": "NASA2026-BIAS-4892",
    "teamName": "AstroNova",
    "category": "College",
    "institutionName": "BIAS Bhimtal",
    "status": "Approved"
  }
}
```

### 2. Get Registration Details
- **Endpoint**: `GET /registration/{id}`
- **Response**: `200 OK`

### 3. Download ID Card Details
- **Endpoint**: `GET /id-card/{id}`
- **Response**: `200 OK`

### 4. Admin Statistics
- **Endpoint**: `GET /admin/stats`
- **Response**: `200 OK`
```json
{
  "totalRegistrations": 1248,
  "totalTeams": 320,
  "schoolTeams": 142,
  "collegeTeams": 178
}
```

---

## 🛠️ Deployment Instructions

### Option 1: Vercel / Netlify / GitHub Pages (Static Hosting)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - NASA Space Apps 2026 Platform"
   git branch -M main
   git remote add origin https://github.com/your-org/nasa-space-apps-admin.git
   git push -u origin main
   ```
2. Connect your GitHub repository to **Vercel** or **Netlify**.
3. Set build command to empty and publish directory to `./`.

### Option 2: Supabase Backend Integration
1. Log in to [Supabase Console](https://supabase.com).
2. Create a new project and navigate to the **SQL Editor**.
3. Paste and execute the contents of `schema.sql`.
4. Connect the frontend by adding `@supabase/supabase-js` client in `js/app.js`.

---

## 🔑 Admin Credentials
- **Route**: Access via **ADMIN LOGIN** button or `#admin`
- **Email**: `admin@nasa.gov`
- **Password**: `spaceapps2026`

---

© 2026 NASA Space Apps Challenge BIAS Bhimtal • Organised by Astroverse & BIAS Innovation Cell.
