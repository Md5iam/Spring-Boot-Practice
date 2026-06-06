# SEUOJ — Southeast University Online Judge

> A full-stack competitive programming and online judging platform built for Southeast University, Department of Computer Science & Engineering.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Database Setup (PostgreSQL)](#2-database-setup-postgresql)
  - [3. Backend Setup (Spring Boot)](#3-backend-setup-spring-boot)
  - [4. Frontend Setup (React + Vite)](#4-frontend-setup-react--vite)
  - [5. Running the Application](#5-running-the-application)
- [API Endpoints](#api-endpoints)
- [Authentication & Security](#authentication--security)
- [CRUD Operations](#crud-operations)
- [Search & Filter](#search--filter)
- [Validation & Security Measures](#validation--security-measures)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [License](#license)

---

## Overview

**SEUOJ** is an online judge platform where students can:

- Browse and solve programming problems with varying difficulty levels.
- Submit solutions in multiple languages (C, C++, Java, Python) and receive instant verdicts.
- Participate in live, scheduled programming contests with real-time standings.
- Track their performance via an Elo-based rating system and global leaderboard.
- Create and propose new problems for administrative review.

Administrators can:

- Manage users (ban/unban, role assignment).
- Create, update, and delete problems and contests.
- Review and approve/reject community-submitted problems.
- Monitor platform activity through admin dashboards.

---

## Features

| Category | Feature | Description |
|---|---|---|
| **Authentication** | Registration & Login | Secure user sign-up, sign-in, and sign-out with JWT tokens |
| **Authentication** | Role-Based Access | `ROLE_USER` and `ROLE_ADMIN` with route-level guards |
| **Problems** | Full CRUD | Create, Read, Update, Delete problems (admin) |
| **Problems** | Problem Proposal | Users can propose problems; admins approve/reject |
| **Problems** | Difficulty & Tags | Filter by difficulty (EASY, MEDIUM, HARD) and language tags |
| **Submissions** | Code Submission | Submit solutions in C, C++, Java, or Python |
| **Submissions** | Auto-Judging | Sandboxed compilation & execution with verdict (AC, WA, TLE, RE, CE) |
| **Contests** | Contest Lifecycle | Create contests with start/end times, register participants |
| **Contests** | Live Standings | Real-time leaderboard sorted by problems solved and penalty time |
| **Contests** | Elo Rating System | Codeforces-style rating calculation after contest ends |
| **Leaderboard** | Global Rankings | Ranked by rating with search/filter capability |
| **Admin** | User Management | View all users, ban/unban, change roles |
| **Admin** | Problem Review | Approve or reject user-proposed problems |
| **UI/UX** | Animated Landing | Canvas-based animated background with floating code snippets |
| **UI/UX** | Responsive Design | Mobile-friendly, modern UI with Tailwind CSS |
| **Navigation** | Hash-Based Routing | Browser back/forward button support |

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Core programming language |
| Spring Boot | 4.0.6 | Backend framework |
| Spring Security | (bundled) | Authentication & authorization |
| Spring Data JPA | (bundled) | ORM / database access |
| PostgreSQL | 15+ | Relational database |
| JWT (jjwt) | 0.13.0 | Token-based authentication |
| Lombok | (latest) | Boilerplate code reduction |
| ModelMapper | 3.2.4 | DTO ↔ Entity mapping |
| Maven | (wrapper) | Build tool & dependency management |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI component library |
| TypeScript | 6.x | Type-safe JavaScript |
| Vite | 8.x | Build tool & dev server |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Lucide React | 1.x | Icon library |

### Fonts

- **Space Grotesk** — Primary UI font
- **Bebas Neue** — Display / headline font
- **Fira Code** — Monospace / code editor font

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│  React 19 + TypeScript + Vite + Tailwind CSS             │
│  Components: Navbar, Hero, ProblemsDashboard,            │
│  CodingArena, ContestsDashboard, Leaderboard, etc.       │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTP (REST API + JWT)
                          │ Port 5173 → proxy → Port 8081
                          ▼
┌──────────────────────────────────────────────────────────┐
│                  SERVER (Spring Boot 4)                   │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Controllers  │  │   Services   │  │  Repositories  │  │
│  │ (REST API)   │→ │ (Business    │→ │ (Spring Data   │  │
│  │              │  │  Logic)      │  │  JPA)          │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │          Spring Security + JWT Filter             │    │
│  │  (Authentication, Authorization, CORS, CSRF)      │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────┬────────────────────────────────┘
                          │ JDBC (Hibernate ORM)
                          ▼
┌──────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL 15+)                    │
│                                                          │
│  Tables: users, roles, user_role, problems, test_cases,  │
│  submissions, contests, contest_participants,            │
│  contest_problems, notifications, problem_reports,       │
│  admin_activity_logs                                     │
└──────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity-Relationship Summary

```
users ──< user_role >── roles
  │
  ├──< submissions
  │       └── problem (FK)
  │       └── contest (FK, nullable)
  │
  ├──< contest_participants >── contests
  │
  ├──< problems (created_by FK)
  │       └──< test_cases
  │
  └──< problem_reports
       └── problem (FK)

contests ──< contest_problems >── problems
contests ──< submissions (contest FK)
```

### Core Tables

#### `users`
| Column | Type | Constraints |
|---|---|---|
| user_id | BIGINT (PK) | Auto-increment |
| username | VARCHAR(20) | UNIQUE, NOT NULL |
| email | VARCHAR(50) | UNIQUE, NOT NULL, Email format |
| password | VARCHAR(120) | NOT NULL (BCrypt hashed) |
| rating | INTEGER | Default: 0 |
| solved_count | INTEGER | Default: 0 |
| is_banned | BOOLEAN | Default: false |
| ban_reason | VARCHAR | Nullable |
| ban_until | TIMESTAMP | Nullable |
| joined_date | TIMESTAMP | Default: NOW() |

#### `roles`
| Column | Type | Constraints |
|---|---|---|
| role_id | INTEGER (PK) | Auto-increment |
| name | VARCHAR | ROLE_USER, ROLE_ADMIN |

#### `problems`
| Column | Type | Constraints |
|---|---|---|
| problem_id | BIGINT (PK) | Auto-increment |
| title | VARCHAR | UNIQUE, NOT NULL |
| description | TEXT | NOT NULL |
| input_format | TEXT | Nullable |
| output_format | TEXT | Nullable |
| constraints | TEXT | Nullable |
| difficulty | ENUM | EASY, MEDIUM, HARD |
| time_limit_ms | INTEGER | Default: 1000 |
| memory_limit_mb | INTEGER | Default: 256 |
| tags | VARCHAR | Comma-separated |
| explanation | TEXT | Nullable |
| is_visible | BOOLEAN | Default: true |
| created_by | BIGINT (FK) | References users |

#### `test_cases`
| Column | Type | Constraints |
|---|---|---|
| test_case_id | BIGINT (PK) | Auto-increment |
| input | TEXT | |
| expected_output | TEXT | |
| type | ENUM | SAMPLE, HIDDEN |
| problem_id | BIGINT (FK) | References problems |

#### `submissions`
| Column | Type | Constraints |
|---|---|---|
| submission_id | BIGINT (PK) | Auto-increment |
| code | TEXT | |
| language | ENUM | C, CPP, JAVA, PYTHON |
| status | ENUM | PENDING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR, COMPILATION_ERROR |
| execution_time_ms | INTEGER | Nullable |
| memory_used_kb | INTEGER | Nullable |
| submitted_at | TIMESTAMP | Default: NOW() |
| error_message | TEXT | Nullable |
| user_id | BIGINT (FK) | References users |
| problem_id | BIGINT (FK) | References problems |
| contest_id | BIGINT (FK) | Nullable, references contests |

#### `contests`
| Column | Type | Constraints |
|---|---|---|
| contest_id | BIGINT (PK) | Auto-increment |
| title | VARCHAR | NOT NULL |
| description | TEXT | Nullable |
| start_time | TIMESTAMP | NOT NULL |
| end_time | TIMESTAMP | NOT NULL |
| is_rating_calculated | BOOLEAN | Default: false |

#### `contest_participants` (Join Table)
| Column | Type |
|---|---|
| contest_id | BIGINT (FK) |
| user_id | BIGINT (FK) |

#### `contest_problems`
| Column | Type |
|---|---|
| id | BIGINT (PK) |
| contest_id | BIGINT (FK) |
| problem_id | BIGINT (FK) |

---

## Project Structure

```
SEUOJ/
├── pom.xml                          # Maven build config
├── mvnw / mvnw.cmd                  # Maven wrapper scripts
│
├── src/main/java/org/example/seuoj/
│   ├── SeuojApplication.java        # Spring Boot entry point
│   │
│   ├── model/                       # JPA Entity classes
│   │   ├── User.java
│   │   ├── Role.java
│   │   ├── Problem.java
│   │   ├── TestCase.java
│   │   ├── Submission.java
│   │   ├── Contest.java
│   │   ├── ContestProblem.java
│   │   ├── Notification.java
│   │   ├── ProblemReport.java
│   │   ├── AdminActivityLog.java
│   │   └── (Enums: AppRole, Difficulty, Language,
│   │          SubmissionStatus, TestCaseType, etc.)
│   │
│   ├── repositories/                # Spring Data JPA Repositories
│   │   ├── UserRepository.java
│   │   ├── ProblemRepository.java
│   │   ├── SubmissionRepository.java
│   │   ├── ContestRepository.java
│   │   ├── TestCaseRepository.java
│   │   └── ...
│   │
│   ├── service/                     # Business logic layer
│   │   ├── AuthService[Impl].java
│   │   ├── ProblemService[Impl].java
│   │   ├── SubmissionService[Impl].java
│   │   ├── ContestService[Impl].java
│   │   ├── JudgeService[Impl].java      # Code execution engine
│   │   ├── UserService[Impl].java
│   │   ├── NotificationService[Impl].java
│   │   ├── ReportService[Impl].java
│   │   ├── TestCaseService[Impl].java
│   │   ├── AdminLogService[Impl].java
│   │   └── AsyncJudgeExecutor.java       # Async submission processing
│   │
│   ├── controller/                  # REST API controllers
│   │   ├── AuthController.java          # /api/auth/**
│   │   ├── ProblemController.java       # /api/problems/**
│   │   ├── ContestController.java       # /api/contests/**
│   │   ├── UserController.java          # /api/users/**
│   │   ├── AdminController.java         # /api/admin/**
│   │   └── NotificationController.java  # /api/notifications/**
│   │
│   ├── security/                    # Spring Security config
│   │   ├── WebSecurityConfig.java
│   │   ├── jwt/
│   │   │   ├── JwtUtils.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   └── JwtAuthEntryPoint.java
│   │   └── service/
│   │       └── UserDetailsServiceImpl.java
│   │
│   ├── Auth/                        # Auth request/response DTOs
│   ├── Configuration/               # App configuration beans
│   ├── exceptions/                  # Custom exception classes
│   └── payload/                     # API payload DTOs
│
├── src/main/resources/
│   └── application.properties       # Database, JWT, server config
│
└── frontend/                        # React + Vite frontend
    ├── package.json
    ├── vite.config.ts               # Vite config with API proxy
    ├── tsconfig.json
    ├── index.html                   # HTML entry point
    │
    └── src/
        ├── main.tsx                 # React entry point
        ├── App.tsx                  # Root component with routing
        ├── index.css                # Global styles, Tailwind config
        │
        └── components/
            ├── Navbar.tsx               # Pill-shaped navigation bar
            ├── Hero.tsx                 # Landing page hero section
            ├── Stats.tsx                # Platform statistics counters
            ├── Features.tsx             # Feature showcase grid
            ├── ActiveContests.tsx       # Contest preview cards
            ├── Footer.tsx               # Footer component
            ├── AuthModal.tsx            # Sign In / Register modal
            ├── BackgroundCodeParticles.tsx # Canvas animated background
            ├── ProblemsDashboard.tsx     # Problems listing + filters
            ├── ProblemCreationModal.tsx  # Create/edit problem form
            ├── ProblemReviewModal.tsx    # Admin problem review flow
            ├── CodingArena.tsx          # Code editor + submission UI
            ├── SubmissionsDashboard.tsx  # Submission history table
            ├── ContestsDashboard.tsx     # Contest listing + details
            ├── ContestCreationModal.tsx  # Create contest form
            ├── Leaderboard.tsx          # Global ranking table
            └── UsersDashboard.tsx       # Admin user management
```

---

## Prerequisites

Before running this project, ensure the following are installed:

| Software | Version | Download |
|---|---|---|
| **Java JDK** | 17 or later | [adoptium.net](https://adoptium.net/) |
| **Node.js** | 18 or later | [nodejs.org](https://nodejs.org/) |
| **npm** | 9 or later | Bundled with Node.js |
| **PostgreSQL** | 15 or later | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | Any | [git-scm.com](https://git-scm.com/) |

> **Note:** For code execution (judging), the following compilers/interpreters must be available on the system PATH:
> - `g++` (C/C++ compilation)
> - `javac` + `java` (Java compilation & execution)
> - `python3` (Python execution)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/SEUOJ.git
cd SEUOJ
```

### 2. Database Setup (PostgreSQL)

Open the PostgreSQL CLI (`psql`) or pgAdmin and create the database:

```sql
CREATE DATABASE seuoj;
```

> The tables are auto-generated by Hibernate on first run (`spring.jpa.hibernate.ddl-auto=update`). No manual SQL migration is required.

### 3. Backend Setup (Spring Boot)

#### a) Configure Database Credentials

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/seuoj
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

#### b) Build and Run

Using the Maven wrapper (no global Maven installation needed):

```bash
# Linux / macOS
./mvnw clean compile
./mvnw spring-boot:run

# Windows
mvnw.cmd clean compile
mvnw.cmd spring-boot:run
```

The backend server will start on **`http://localhost:8081`**.

### 4. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start on **`http://localhost:5173`**.

> The Vite config includes an API proxy that forwards all `/api/*` requests to `http://localhost:8081`, so no CORS issues during development.

### 5. Running the Application

1. Start PostgreSQL service.
2. Start the backend: `./mvnw spring-boot:run` (from the project root).
3. Start the frontend: `npm run dev` (from the `frontend/` directory).
4. Open **`http://localhost:5173`** in your browser.

#### Default Admin Account

On first startup, the application automatically seeds the following roles:
- `ROLE_USER`
- `ROLE_ADMIN`

To create an admin account, register a new user, then manually update their role in the database:

```sql
-- After registering a user, find their user_id:
SELECT user_id FROM users WHERE username = 'your_admin_username';

-- Find the admin role_id:
SELECT role_id FROM roles WHERE name = 'ROLE_ADMIN';

-- Assign the admin role:
INSERT INTO user_role (user_id, role_id) VALUES (<user_id>, <admin_role_id>);
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register a new user | Public |
| POST | `/api/auth/signin` | Sign in, receive JWT token | Public |

### Problems (`/api/problems`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/problems` | List all visible problems | Public |
| GET | `/api/problems/{id}` | Get problem details | Public |
| POST | `/api/problems` | Create a new problem | Admin |
| PUT | `/api/problems/{id}` | Update a problem | Admin |
| DELETE | `/api/problems/{id}` | Delete a problem | Admin |
| POST | `/api/problems/{id}/submit` | Submit a solution | User |
| GET | `/api/problems/pending` | List pending problem proposals | Admin |
| POST | `/api/problems/{id}/approve` | Approve a proposed problem | Admin |
| POST | `/api/problems/{id}/reject` | Reject a proposed problem | Admin |

### Contests (`/api/contests`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/contests` | List all contests | Public |
| GET | `/api/contests/{id}` | Get contest details + standings | Public |
| POST | `/api/contests` | Create a new contest | Admin |
| POST | `/api/contests/{id}/register` | Register for a contest | User |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/leaderboard` | Get global leaderboard | Public |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/users` | List all users | Admin |
| PUT | `/api/admin/users/{id}/ban` | Ban a user | Admin |
| PUT | `/api/admin/users/{id}/unban` | Unban a user | Admin |
| PUT | `/api/admin/users/{id}/role` | Change user role | Admin |

---

## Authentication & Security

### JWT-Based Authentication Flow

```
1. User registers via POST /api/auth/signup
   → Password is hashed using BCrypt
   → User record is created with ROLE_USER

2. User signs in via POST /api/auth/signin
   → Credentials validated against BCrypt hash
   → JWT token generated (valid for 24 hours)
   → Token returned in the response body

3. Authenticated requests include:
   → Authorization: Bearer <JWT_TOKEN>
   → JwtAuthFilter extracts and validates the token
   → SecurityContext is populated with user details

4. Role-based access control:
   → @PreAuthorize or SecurityConfig path matchers
   → ROLE_USER: submit solutions, register for contests
   → ROLE_ADMIN: manage problems, contests, users
```

### Security Measures

- **Password Hashing**: BCrypt encoder via Spring Security.
- **JWT Tokens**: Signed with HMAC-SHA256, 24-hour expiry.
- **CSRF Protection**: Disabled for stateless REST API (JWT-based).
- **CORS**: Configured to allow frontend origin.
- **Input Validation**: Jakarta Bean Validation (`@NotBlank`, `@Email`, `@Size`).
- **SQL Injection Prevention**: Parameterized queries via Spring Data JPA / Hibernate.
- **Sandboxed Execution**: Submitted code is compiled and executed with strict time and memory limits.

---

## CRUD Operations

The primary CRUD entity is **Problem**:

| Operation | Frontend Component | API Endpoint | Access |
|---|---|---|---|
| **Create** | `ProblemCreationModal.tsx` | `POST /api/problems` | Admin |
| **Read** | `ProblemsDashboard.tsx`, `CodingArena.tsx` | `GET /api/problems`, `GET /api/problems/{id}` | All users |
| **Update** | `ProblemCreationModal.tsx` (edit mode) | `PUT /api/problems/{id}` | Admin |
| **Delete** | `ProblemsDashboard.tsx` (admin actions) | `DELETE /api/problems/{id}` | Admin |

Additional CRUD entities:
- **Contests**: Create, Read, Update lifecycle via `ContestsDashboard.tsx` + `ContestCreationModal.tsx`.
- **Users**: Read, Ban/Unban, Role assignment via `UsersDashboard.tsx`.
- **Submissions**: Create (submit code), Read (submission history).

---

## Search & Filter

| Feature | Location | Description |
|---|---|---|
| **Problem Search** | Problems Dashboard | Search by title keyword |
| **Difficulty Filter** | Problems Dashboard | Filter by EASY / MEDIUM / HARD |
| **Language Filter** | Problems Dashboard | Filter by supported languages |
| **Leaderboard Search** | Leaderboard | Search users by username |
| **User Search** | Admin Users Dashboard | Search by username |
| **Submission Filter** | Submissions Dashboard | Filter by status (AC, WA, TLE, etc.) |

---

## Validation & Security Measures

| Measure | Implementation |
|---|---|
| **Input Validation** | Jakarta Bean Validation annotations on all entity fields (`@NotBlank`, `@Email`, `@Size`, `@NotNull`) |
| **SQL Injection Prevention** | Spring Data JPA generates parameterized queries; no raw SQL concatenation |
| **XSS Prevention** | React auto-escapes all rendered content by default |
| **Authentication** | JWT tokens with 24-hour expiry, BCrypt password hashing |
| **Authorization** | Role-based access control via Spring Security configuration |
| **CORS** | Restricted to frontend origin in `WebSecurityConfig.java` |
| **Sandboxed Code Execution** | Submitted code runs with strict time limits (configurable per problem) and memory limits |
| **Rate Limiting** | Duplicate submission prevention on the frontend |

---

## Environment Variables

All configuration is stored in `src/main/resources/application.properties`:

| Property | Description | Default |
|---|---|---|
| `spring.datasource.url` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/seuoj` |
| `spring.datasource.username` | Database username | `postgres` |
| `spring.datasource.password` | Database password | *(set your own)* |
| `spring.jpa.hibernate.ddl-auto` | Schema generation strategy | `update` |
| `seuoj.app.jwtSecret` | JWT signing secret key | *(256-bit hex string)* |
| `seuoj.app.jwtExpirationMs` | JWT token expiry in milliseconds | `86400000` (24 hours) |
| `server.port` | Backend server port | `8081` |

---

## Screenshots

> *(Add screenshots of your application here)*
>
> Recommended screenshots:
> 1. **Landing Page** — Hero section with animated background
> 2. **Sign In / Register** — Authentication modal
> 3. **Problems Dashboard** — Problem listing with filters
> 4. **Coding Arena** — Code editor with submission UI
> 5. **Contests Dashboard** — Contest listing and details
> 6. **Leaderboard** — Global ranking table
> 7. **Admin Panel** — User management dashboard

---

*Built with ❤️ using Spring Boot, React, TypeScript, and PostgreSQL.*
