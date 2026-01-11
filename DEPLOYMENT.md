# Deployment Guide

This project is configured for deployment using **Render** (Backend) and **Vercel** (Frontend).

## Prerequisites

1.  **Push to GitHub**: Ensure all your code is pushed to your GitHub repository.
    ```bash
    git add .
    git commit -m "Prepare for deployment"
    git push origin main
    ```

## 1. Backend Deployment (Render)

1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `edu2job-backend` (or similar)
    *   **Root Directory**: `backend`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `./build.sh`
    *   **Start Command**: `gunicorn core.wsgi:application`
5.  **Environment Variables**:
    *   `PYTHON_VERSION`: `3.9.0` (or your local version)
    *   `SECRET_KEY`: (Generate a strong random string)
    *   `DEBUG`: `False`
    *   `ALLOWED_HOSTS`: `*` (or your frontend domain later)
    *   `GEMINI_API_KEY`: (Your Google Gemini API Key)
    *   `CORS_ALLOW_ALL_ORIGINS`: `True` (or `False` if setting specific origins)
    *   `CSRF_TRUSTED_ORIGINS`: `https://your-frontend.vercel.app` (add this after deploying frontend)
6.  **Database**:
    *   Render offers a managed PostgreSQL database. Create one and link it to your Web Service. Render will automatically set the `DATABASE_URL` environment variable.
    *   *Note*: If you stick with the free tier, the database might expire after 30 days. For persistent data, upgrade the plan or use an external provider like Supabase.

## 2. Frontend Deployment (Vercel)

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: The URL of your deployed Render backend (e.g., `https://edu2job-backend.onrender.com`).
        *   *Important*: Do not add a trailing slash `/`.
6.  Click **Deploy**.

## 3. Custom Domain Setup (GitHub Student Pack) 🎓

If you are a student, you can get a free domain (e.g., `.me`, `.tech`) for 1 year.

### Step 1: Claim the Pack
1.  Go to [GitHub Student Developer Pack](https://education.github.com/pack).
2.  Click **Sign up for Student Developer Pack**.
3.  Verify your student status (upload school ID or use `.edu` email).
4.  Once approved (can take a few days), go to the **Benefits** page.

### Step 2: Get Your Free Domain
1.  Look for **Namecheap** or **Name.com** in the benefits list.
2.  Click the link to claim your free domain (e.g., `www.your-name.me`).
3.  Complete the "purchase" (it should be $0.00).

### Step 3: Connect to Vercel
1.  Go to your **Vercel Dashboard** > Select Project > **Settings** > **Domains**.
2.  Enter your new domain (e.g., `www.edu2job.me`) and click **Add**.
3.  Vercel will show you DNS records (A Record and CNAME).
4.  Go to your Domain Registrar (Namecheap/Name.com) dashboard.
5.  Find **DNS Management** or **Advanced DNS**.
6.  Add the records provided by Vercel:
    *   **Type**: A | **Host**: @ | **Value**: 76.76.21.21
    *   **Type**: CNAME | **Host**: www | **Value**: cname.vercel-dns.com
7.  Wait for propagation (creates HTTPS automatically).

## 4. Final Steps

1.  Once the Frontend is deployed, copy its URL (e.g., `https://edu2job-frontend.vercel.app`).
2.  Go back to Render Backend settings -> Environment Variables.
3.  Update (or add) `CSRF_TRUSTED_ORIGINS` to include your frontend URL.
4.  (Optional) Set `CORS_ALLOW_ALL_ORIGINS` to `False` and add `CORS_ALLOWED_ORIGINS` with your frontend URL.

## 5. Architecture & Data Flow

Understanding how data moves through your application:

### The Components
1.  **Frontend (Vercel)**: The React website users see in their browser (`https://edu2-job.vercel.app`).
2.  **Backend (Render Web Service)**: The Django API that processes logic (`https://edu2job-backend-bl03.onrender.com`).
3.  **Database (Render PostgreSQL)**: Where data (users, predictions) is stored.

### The Flow
1.  **User Action**: A user clicks "Login" on your Frontend.
2.  **Request**: The Frontend sends an HTTPS request (e.g., `POST /api/login/`) to your Backend URL.
    *   *Security*: This is allowed because you configured `CORS_ALLOWED_ORIGINS` on the Backend.
3.  **Processing**:
    *   Django receives the request.
    *   It checks the **Database** to verify username/password.
    *   The Database returns the user data to Django.
4.  **Response**: Django sends a JSON response (e.g., `{ token: "abc...", user: "John" }`) back to the Frontend.
5.  **Display**: The Frontend receives the data and updates the screen (e.g., redirects to Dashboard).

### Diagram
```mermaid
sequenceDiagram
    participant User
    participant Frontend (Vercel)
    participant Backend (Render)
    participant Database (PostgreSQL)

    User->>Frontend (Vercel): Clicks Button
    Frontend (Vercel)->>Backend (Render): API Request (HTTPS)
    Backend (Render)->>Database (PostgreSQL): Query Data
    Database (PostgreSQL)-->>Backend (Render): Return Results
    Backend (Render)-->>Frontend (Vercel): JSON Response
    Frontend (Vercel)-->>User: Update UI
```
