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
