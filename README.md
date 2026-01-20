# Academic Calendar Project

A Django-React application for managing academic schedules.

## Prerequisites

-   **Python 3.10+**
-   **Node.js 18+** & **npm**

## Project Structure

-   `backend/`: Django project (API & static file server).
-   `frontend/`: React application (Vite).

## Setup Instructions

### 1. Frontend Setup

The frontend needs to be built so Django can serve the static files.

```bash
cd frontend
npm install
npm run build
```

This will create a `dist/` directory with the compiled assets.

> NOTE: During development you can run the frontend dev server instead of building.
>
> ```bash
> cd frontend
> npm install
> npm run dev
> ```
>
> The dev server serves the app at: http://localhost:8080/ (open this URL after running `npm run dev`).

#### Production build and API host

The frontend reads `VITE_API_BASE` at build time to determine the API root used by the app. By default the frontend uses same-origin calls (empty `VITE_API_BASE`) so requests like `/api/...` are sent to the same host that serves the frontend.

- If Django will serve the built frontend (recommended): leave `VITE_API_BASE` empty and copy the build output into Django's static files (or let `collectstatic` pick up `frontend/dist`). The default Vite `base` is `/static/` so built assets should be served from `/static/`.
- If the API is on a different host/origin, set `VITE_API_BASE` when building. Example (PowerShell):

```powershell
$Env:VITE_API_BASE='https://api.example.com'
npm run build --prefix frontend
```

Or create `frontend/.env.production` containing:

```
VITE_API_BASE=https://api.example.com
```

Then run `npm run build` in `frontend`.

### 2. Backend Setup

Create a virtual environment and install dependencies.

```bash
cd backend
python -m venv venv

# Activate venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt
```

### 3. Database & User

Initialize the database and create an admin user.

```bash
# Apply migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser
```

### 4. Running the Application

Start the Django development server.

```bash
python manage.py runserver
```

Run the server as shown above; you do not need to directly open the backend URL in your browser during development. If you're running the frontend dev server (`npm run dev`), open the frontend at http://localhost:8080/ instead.

## Features

-   **Authentication**: JWT-based auth handling both username and email login.
-   **Profile**: Dynamic user profile fetching and display.
-   **Integration**: React Single Page Application (SPA) served directly by Django.
