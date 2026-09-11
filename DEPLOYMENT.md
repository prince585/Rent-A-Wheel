# RentWheels — Complete Production Deployment Guide

This guide details the step-by-step process for deploying the **RentWheels** application:
- **Backend**: Java 21 + Spring Boot 4.1.1 + MongoDB Atlas (Deployed via Render / Docker)
- **Frontend**: Vanilla HTML/CSS/JS (Deployed via Vercel / Netlify / Render Static Site)

---

## Table of Contents
1. [Prerequisites & System Architecture](#1-prerequisites--system-architecture)
2. [Step 1: Local Pre-Push Safety Check](#step-1-local-pre-push-safety-check)
3. [Step 2: Push Repository to GitHub](#step-2-push-repository-to-github)
4. [Step 3: MongoDB Atlas IP Access Configuration](#step-3-mongodb-atlas-ip-access-configuration)
5. [Step 4: Deploying Backend on Render](#step-4-deploying-backend-on-render)
6. [Step 5: Deploying Frontend on Vercel / Netlify](#step-5-deploying-frontend-on-vercel--netlify)
7. [Step 6: Post-Deployment Verification](#step-6-post-deployment-verification)
8. [Troubleshooting & Gotchas](#troubleshooting--gotchas)

---

## 1. Prerequisites & System Architecture

| Component | Technology | Hosting Target |
|---|---|---|
| **Backend** | Java 21, Spring Boot 4.1.1, Maven | Render Web Service / Docker Container |
| **Database** | MongoDB Atlas (Cloud M0 Tier) | AWS Mumbai (`ap-south-1`) |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript ES6 | Vercel / Netlify / Render Static Site |

### Prerequisites
- A GitHub account.
- A free [Render.com](https://render.com) account.
- A free [Vercel.com](https://vercel.com) or [Netlify.com](https://netlify.com) account.
- Access to your MongoDB Atlas cluster.

---

## Step 1: Local Pre-Push Safety Check

Before pushing to GitHub, verify that no credentials or secret keys are committed.

1. **Verify `application.properties` Uses Environment Variables**:
   In `vehicle-rental-backend/rentedVehicle/src/main/resources/application.properties`:
   ```properties
   spring.application.name=rentedVehicle
   spring.mongodb.uri=${MONGODB_URI}
   spring.mongodb.database=${MONGODB_DATABASE:rentwheels}
   spring.data.mongodb.uri=${MONGODB_URI}
   spring.data.mongodb.database=${MONGODB_DATABASE:rentwheels}
   server.port=${PORT:8080}
   ```

2. **Verify `.gitignore` Configuration**:
   The root `.gitignore` excludes sensitive files:
   ```gitignore
   application-local.properties
   **/application-local.properties
   .env
   *.env
   target/
   **/target/
   *.log
   .idea/
   *.iml
   scratch/
   ```

3. **Check Ignore Rules**:
   Run in terminal to confirm secrets are excluded:
   ```bash
   git check-ignore -v vehicle-rental-backend/rentedVehicle/src/main/resources/application-local.properties
   ```
   *(Output should show `.gitignore` matching rule).*

---

## Step 2: Push Repository to GitHub

Execute the following commands in your terminal from the root folder (`rentwheels/`):

```bash
# 1. Initialize Git (if not already initialized)
git init

# 2. Stage all safe files
git add .

# 3. Create initial commit
git commit -m "Initial commit: RentWheels production ready platform"

# 4. Set main branch
git branch -M main

# 5. Add remote GitHub repository
git remote add origin https://github.com/prince585/Rent-A-Wheel.git

# 6. Push to GitHub
git push -u origin main
```

---

## Step 3: MongoDB Atlas IP Access Configuration

Because Render services run on dynamic cloud IP addresses, configure MongoDB Atlas to accept connections from your web service:

1. Log into **[MongoDB Atlas](https://cloud.mongodb.com)**.
2. In the left navigation, click **Network Access** under Security.
3. Click **+ Add IP Address**.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**.

---

## Step 4: Deploying Backend on Render

### Option A: Standard Buildpack (Recommended)

1. Log into **[Render Dashboard](https://dashboard.render.com)**.
2. Click **New +** ➔ Select **Web Service**.
3. Connect your **GitHub repository** (`rentwheels`).
4. Fill in the deployment details:
   - **Name**: `rentwheels-backend`
   - **Region**: Singapore or Frankfurt (closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `vehicle-rental-backend/rentedVehicle`
   - **Runtime**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/rentedVehicle-0.0.1-SNAPSHOT.jar`
5. Scroll down to **Environment Variables** ➔ Click **Add Environment Variable**:
   - **Key**: `MONGODB_URI`
     **Value**: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=rentwheels`
   - **Key**: `MONGODB_DATABASE`
     **Value**: `rentwheels`
6. Click **Create Web Service**.

### Option B: Docker Deployment

Render will automatically detect the `Dockerfile` in `vehicle-rental-backend/rentedVehicle/Dockerfile`:
- Select **Runtime**: `Docker`.
- Add the `MONGODB_URI` and `MONGODB_DATABASE` environment variables.
- Render will build the container using Java 21 and run it automatically.

Once deployed, Render provides your live backend URL, e.g.:
`https://rentwheels-backend.onrender.com`

---

## Step 5: Deploying Frontend on Vercel / Netlify

### Option A: Vercel (Recommended)

1. Log into **[Vercel Dashboard](https://vercel.com)**.
2. Click **Add New...** ➔ **Project**.
3. Import your `rentwheels` GitHub repository.
4. Set **Root Directory** to `vehicle-rental-frontend`.
5. Under **Environment Variables**, add (Optional override):
   - **Key**: `RENTWHEELS_API_URL`
   - **Value**: `https://rentwheels-backend.onrender.com/api`
6. Click **Deploy**.

### Option B: Netlify

1. Log into **[Netlify Dashboard](https://app.netlify.com)**.
2. Click **Add new site** ➔ **Import an existing project**.
3. Connect GitHub ➔ Select `rentwheels`.
4. Set **Base directory** to `vehicle-rental-frontend`.
5. Set **Build command**: (Leave empty).
6. Set **Publish directory**: `.`
7. Click **Deploy Site**.

---

## Step 6: Post-Deployment Verification

Once both frontend and backend are live:

1. **Verify Backend Health**:
   Open in browser:
   `https://rentwheels-backend.onrender.com/api/vehicles/available`
   *(Should return JSON array of vehicles with images).*

2. **Verify Frontend UI**:
   Open your live Vercel/Netlify URL:
   - Check available fleet loading.
   - Click **Rent Now** ➔ Confirm rental.
   - Verify redirect to **Active Rental Cockpit** with live ticking meter.
   - Click **Return Vehicle** ➔ Confirm receipt modal.
   - Open **Rental History** ➔ Verify settlement invoice logged in table.

---

## Troubleshooting & Gotchas

### 1. CORS Error in Browser Console
- **Symptom**: `Access to fetch at ... has been blocked by CORS policy`.
- **Fix**: The backend contains `CorsConfig.java` with `allowedOriginPatterns("*")`. Ensure backend changes were committed and deployed.

### 2. Render Backend Fails to Connect to MongoDB
- **Symptom**: `MongoSocketOpenException` / `Connection refused`.
- **Fix**: Check MongoDB Atlas **Network Access** and verify `0.0.0.0/0` is listed in IP access list.

### 3. Render Free Tier Spin-Down Delay
- **Symptom**: First API request takes ~30-50 seconds after inactivity.
- **Explanation**: Render's free tier sleeps services after 15 minutes of inactivity. Subsequent requests are instant.
