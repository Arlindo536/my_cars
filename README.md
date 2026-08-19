

Readme · MD
# my_cars
 
A full-stack car management system built with **Django REST Framework** and **Angular**, developed as part of the ITWorks internship.
 
The application allows users to register, manage their own vehicles, and — depending on their role — either operate within their own personal space (**Customer**) or manage the entire platform (**Admin**).
 
---
 
## Tech Stack
 
**Backend**
- Django + Django REST Framework
- PostgreSQL
- Token Authentication (`rest_framework.authtoken`)
**Frontend**
- Angular (module-based architecture, lazy-loaded feature modules)
- Angular Material (dialogs, snackbar notifications, icons)
- Bootstrap 5 (layout, responsiveness, components)
---
 
## Features
 
### Authentication
- User registration
- Login (token-based)
- Change password
- View and update profile
- Self-service account deletion
### Customer Panel
- View own cars (paginated, searchable, sortable)
- View detailed information for a specific car
- Create, edit, and delete own cars
- Bulk-select and delete multiple cars at once
### Admin Panel
- View all users, grouped by role (Admin / Customer)
- View all cars, grouped and paginated by owner
- Full CRUD on any user, including role management
- Full CRUD on any car, including assigning a car to a specific user
- Search and sort across users and cars
- Bulk-select and delete
### Security
- Role-based permissions enforced on the backend (Customers can only access their own data; Admins have full access)
- Token authentication required on all protected endpoints
- Frontend route guards prevent unauthorized navigation, backed by real backend enforcement
- Confirmation dialogs on all destructive actions
---
 
## Project Structure
 
```
my_cars/
├── backend/          # Django REST Framework API
│   ├── config/        # Project settings, URLs
│   ├── users/          # Authentication, profiles, admin user management
│   └── cars/            # Car model, CRUD, ownership permissions
└── frontend/          # Angular application
    └── src/app/
        ├── auth/         # Register, login, profile, password/account management
        ├── car/           # Customer-facing car CRUD
        ├── admin/         # Admin panel (users + cars)
        └── nav-bar/        # Shared, role-aware navigation
```
 
---
 
## Local Setup
 
**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in `backend/` with your database credentials and secret key, then:
```bash
python manage.py migrate
python manage.py runserver
```
 
**Frontend**
```bash
cd frontend
npm install
ng serve
```
 
The app expects the backend running at `http://127.0.0.1:8000` and will be available at `http://localhost:4200` (or the port specified when running `ng serve`).
 
---
 
## Notes
 
This project follows a set of architectural constraints requested for the internship: separate Django apps per domain, class-based views throughout, manually-defined DRF serializers (rather than `ModelSerializer`), and a module-based Angular structure with lazy-loaded routing.
 



























