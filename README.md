# Proyecto Integrador — Django + React

Full-stack capstone project with a Django REST API (JWT + SOAP) and a React
client built with Vite, Semantic UI React and React Router v6.

```
Resultado de aprendizaje/
├── backend/            Django 6.1 project (API, users, SOAP)
├── frontend/           React 18 + Vite client
└── README.md
```

## Stack

| Layer     | Technology |
|-----------|------------|
| Backend   | Django 6.1.1, Django REST Framework 3.18, SimpleJWT 5.5, drf-yasg, zeep, django-cors-headers |
| Database  | MySQL / MariaDB (`proyecto_integrador`) |
| Frontend  | React 18, Vite 8, React Router 6, Semantic UI React, Formik, Yup, React Toastify, Sass |

## Quick start

### 1. Backend

```bash
cd backend

# Create and activate the virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Database connection defaults: root / root @ 127.0.0.1:3306
# Override with DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT.
mysql -uroot -p -e \
  "CREATE DATABASE IF NOT EXISTS proyecto_integrador CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend URLs:

- API root: <http://localhost:8000/api/v1/>
- Swagger UI: <http://localhost:8000/swagger/>
- ReDoc: <http://localhost:8000/redoc/>
- Django admin: <http://localhost:8000/admin/>

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

Frontend URL: <http://localhost:5173>

Production build:

```bash
npm run build
npm run preview
```

## API reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/token/` | Public | JWT login with `email` + `password`; returns `access` and `refresh` |
| POST | `/api/v1/auth/token/refresh/` | Public | Exchange a refresh token for a new access token |
| POST | `/api/v1/auth/register/` | Public | Register a user; enforces the password policy |
| GET | `/api/v1/auth/me/` | Bearer | Current authenticated user |
| GET/POST/PUT/PATCH/DELETE | `/api/v1/users/` | Bearer + `IsAdminUser` | User CRUD restricted to staff |
| GET | `/api/v1/soap/continents/` | Public | Continents from the public SOAP service |
| GET | `/api/v1/soap/countries/` | Public | Country list from the public SOAP service |
| GET | `/api/v1/soap/countries/<ISO>/` | Public | Country detail (capital, currency, flag, languages) |
| GET | `/api/v1/categories/` | Public | Demo catalog categories from the inherited `products` app |
| GET | `/api/v1/products/` | Bearer | Demo catalog products from the inherited `products` app |

### Password policy

Registration rejects passwords that do not include all of the following:

- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

Django's built-in password validators (common password, numeric-only, etc.) are
also applied.

### SOAP integration

`backend/integrations/services.py` consumes the public
`CountryInfoService` WSDL from `webservices.oorsprong.org` through `zeep`.
The client is cached with `lru_cache`; the views translate SOAP/network errors
into HTTP `503` responses.

## Rubric mapping

| Requirement | Where |
|-------------|-------|
| Virtual environment + Django | `backend/requirements.txt` |
| Custom user with email login | `backend/users/models.py`, `backend/users/managers.py` |
| User registered in Django admin | `backend/users/admin.py` |
| drf-yasg Swagger + ReDoc | `backend/tienda_online/settings.py`, `backend/tienda_online/urls.py` |
| User CRUD restricted to admins | `backend/users/views.py` (`IsAdminUser`) |
| Staff-only user management screen | `frontend/src/pages/admin/UsersPage.jsx`, `frontend/src/api/users.js`, `/admin/users` |
| Protected `/api/v1/auth/me/` | `backend/users/views.py` (`MeView`) |
| JWT login and refresh endpoints | `backend/tienda_online/urls.py` |
| Public register with password validation | `backend/users/serializers.py` (`UserRegisterSerializer`) |
| CORS with credentials for `localhost:5173` | `backend/tienda_online/settings.py` |
| SOAP consumer with zeep | `backend/integrations/` |
| Vite + React + Semantic UI dependencies | `frontend/package.json` |
| Folder structure (`layouts`, `pages`, `routes`, `api`, `context`, `hooks`) | `frontend/src/` |
| `AuthContext`, `useAuth`, localStorage token persistence | `frontend/src/context/AuthContext.jsx`, `frontend/src/hooks/useAuth.js`, `frontend/src/utils/token.js` |
| Protected `AdminLayout` redirecting to login | `frontend/src/layouts/AdminLayout.jsx` |
| Login with Formik + Yup + `loginApi` + Toastify | `frontend/src/pages/auth/LoginPage.jsx`, `frontend/src/api/auth.js` |
| Register with real-time validation | `frontend/src/pages/auth/RegisterPage.jsx` |
| Dashboard with authenticated user data | `frontend/src/pages/client/DashboardPage.jsx`, `frontend/src/components/UserSummaryCard.jsx` |
| Speedrun.com third-party API widget | `frontend/src/hooks/useSpeedrun.js`, `frontend/src/components/SpeedrunWidget.jsx` |

## Verification performed

- `python manage.py check`: no issues.
- Migrations applied to the fresh `proyecto_integrador` database.
- Backend smoke test: 18/18 checks (register, password policy, duplicate email,
  login, refresh, `/me`, 401/403 permissions, Swagger, ReDoc, SOAP, products).
- SOAP live check: 6 continents, 246 countries, Argentina detail.
- Django admin: email login works; custom `User` changelist and change form render.
- Frontend `npm run build`: success.
- Browser E2E: 30/30 checks.
  - Core flow: 14/14 (protected redirect, register, login, dashboard user data,
    Speedrun records, localStorage JWT, logout, invalid-credentials toast).
  - User management: 16/16 (staff-only access, create, edit, promote, search,
    self-delete protection, delete, non-staff redirect).
- Visual audit: no horizontal overflow at 1440 px or 390 px; no console errors
  beyond Semantic UI React deprecation warnings (`findDOMNode`, `defaultProps`),
  which are library-level and non-blocking.

## Notes

- React is pinned to 18.3.1 because `semantic-ui-react` 2.1.5 targets React 18.
- `vite.config.js` sets `build.cssMinify: false` because Vite 8's default
  lightningcss minifier crashes on Semantic UI 2.5 CSS.
- The previous database `django_api` is untouched; this project uses
  `proyecto_integrador`.
- Do not commit `.env` files or real credentials.
