# 👻 Ghost Coach Backend – Simplified Overview

## What It Is
An AI-powered Spring Boot backend that analyzes athletic posture and biomechanics using Google Gemini Pro. Built with Spring Boot 3.2.4 (Java 17) and PostgreSQL.

---

## 🛠️ Tech Stack

| Component    | Technology                        |
|--------------|-----------------------------------|
| Backend      | Spring Boot 3.2.4 (Java 17)       |
| Database     | PostgreSQL + Spring Data JPA      |
| Security     | JWT (JJWT 0.11.5) + Custom Filter |
| AI           | Google Gemini Pro (REST API)      |
| Utilities    | Lombok, Jackson, RestTemplate     |

---

## 📁 Project Structure

com.playmotech.ghostcoach
 ├── config/      → Security, JWT, Filters
 ├── controller/  → API endpoints (Auth + Coaching)
 ├── model/       → User, CoachingSession entities
 ├── repository/  → Database access
 └── dto/         → Data transfer objects

---

## ⚙️ Required Configuration

| Variable       | Required? | Default          |
|----------------|-----------|------------------|
| GEMINI_API_KEY | Yes       | —                |
| DATABASE_URL   | Yes       | localhost:5432   |
| DATABASE_USER  | No        | postgres         |
| DATABASE_PASS  | No        | admin            |
| PORT           | No        | 8080             |

---

## 🚀 Quick Start

### Prerequisites
- JDK 17
- PostgreSQL running on port 5432
- Gemini API key from Google AI Studio

### Setup Steps

1. Create database:
   CREATE DATABASE playmotech_ghostcoach;

2. Set environment variables:
   export GEMINI_API_KEY="your_key_here"

3. Build & run (from /backend folder):
   ./mvnw clean package
   ./mvnw spring-boot:run

Server runs on http://localhost:8080

---

## 📡 Key API Endpoints

### Authentication (No JWT needed)

Endpoint                      | Method | Purpose
------------------------------|--------|------------------------
/api/auth/register            | POST   | Create account
/api/auth/login               | POST   | Get JWT token

### Analysis (Requires Authorization: Bearer <token>)

Endpoint                           | Method | Purpose
-----------------------------------|--------|---------------------------
/api/analysis/analyze              | POST   | Upload image + get analysis
/api/analysis/history              | GET    | View past analyses
/api/analysis/calibration          | PUT    | Update user settings
/api/analysis/history/{id}         | DELETE | Delete a session

Analyze endpoint accepts multipart/form-data with:
- image (required): PNG/JPEG file
- sport, position, experience (optional)

---

## 💡 Pro Tips

1. 403 Forbidden? → Check your Authorization: Bearer <token> header format
2. Large images fail? → Default limit is 5MB; compress before uploading
3. Auto DB schema? → ddl-auto=update is on (safe for dev, change to validate for production)

Ready to analyze athletic stances! 🏃‍♂️
