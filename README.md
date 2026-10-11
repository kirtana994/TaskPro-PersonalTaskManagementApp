# TaskPro – Personal Task Management App

TaskPro is a full-stack personal task management web application built using Django, Django REST Framework, MySQL, and JavaScript. It allows users to register, log in securely, and manage their personal tasks through an interactive dashboard.

Each task includes a title, description, due date, priority, and status. The application ensures that authenticated users can access and manage only their own tasks.

## Features

### User Management
- User registration and login.
- JWT-based authentication using Django REST Framework Simple JWT.
- Protected task operations for authenticated users.
- User-specific task access and management.

### Task Management
- Create tasks with a title, description, due date, priority, and status.
- View a list of personal tasks.
- Retrieve individual task details.
- Edit existing tasks.
- Delete tasks.
- Mark tasks as completed or pending.

### Search, Filtering, and Sorting
- Filter tasks by status: all, completed, or pending.
- Search tasks by title.
- Filter tasks by priority.
- Sort tasks by due date in ascending order.

### Frontend
- Registration and login pages.
- Interactive task dashboard.
- Forms for creating and editing tasks.
- Fetch API integration with the backend.
- Validation errors and success messages.
- Responsive interface using HTML, CSS, Bootstrap, and JavaScript.

### Backend
- Django and Django REST Framework.
- Django ORM for database operations.
- Serializers for validating and transforming API data.
- Class-based views or ViewSets for API endpoints.
- JWT authentication for protected endpoints.
- MySQL database integration.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| UI Framework | Bootstrap |
| Backend | Python, Django |
| REST API | Django REST Framework |
| Authentication | djangorestframework-simplejwt |
| Database | MySQL |
| API Communication | Fetch API |
| Version Control | Git and GitHub |

## Project Structure

```text
TaskPro/
├── manage.py
├── requirements.txt
├── README.md
├── .gitignore
├── project_folder/
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── app_folder/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── tests.py
│   └── admin.py
├── templates/
│   ├── components/
│   ├── home.html
│   ├── login.html
│   └── register.html
└── static/
    ├── css/
    └── js/
```

*Note: Replace `project_folder/` and `app_folder/` with your actual Django project and application names. Adjust the template and static directories to match your implementation.*

## Prerequisites

Before running TaskPro, ensure you have installed:

- Python
- pip
- MySQL Server
- MySQL Workbench (optional)
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd TaskPro
```

Replace the repository URL with your GitHub repository URL.

### 2. Create and Activate a Virtual Environment

Create the environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\Activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

Ensure your `requirements.txt` includes the MySQL database driver used by your project, such as `mysqlclient` or `PyMySQL`.

### 4. Configure MySQL

Open MySQL Workbench or your MySQL client and create a database:

```sql
CREATE DATABASE taskpro_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Configure the database connection in your Django `settings.py` using your database name, username, password, host, and port.

Example configuration:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "taskpro_db",
        "USER": "your_mysql_username",
        "PASSWORD": "your_mysql_password",
        "HOST": "localhost",
        "PORT": "3306",
    }
}
```

Replace the example credentials with your own. For better security, use environment variables rather than committing database credentials to GitHub.

### 5. Apply Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a Superuser (Optional)

```bash
python manage.py createsuperuser
```

This account can access Django's administration interface if the admin site is configured.

### 7. Start the Development Server

```bash
python manage.py runserver
```

Open the application at:

http://127.0.0.1:8000/

Register an account or log in to access the task dashboard.

## Authentication

TaskPro uses JSON Web Tokens (JWT) to authenticate users when accessing protected API endpoints.

Typical authentication flow:

1. A user registers an account.
2. The user submits their credentials through the login page.
3. The backend validates the credentials and returns JWT tokens.
4. The frontend stores the tokens for subsequent API requests.
5. Protected requests include the access token in the `Authorization` header.
6. The backend validates the token and applies the configured permissions.

Example request header:

```http
Authorization: Bearer <access_token>
```

### Authentication Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register/` | Register a user |
| POST | `/api/auth/token/` | Obtain JWT tokens |

The endpoint paths above match the current registration and login implementation. Refresh-token functionality depends on the configured Simple JWT routes.

## Task API Operations

The task API supports the following operations, subject to the application's configured URLs and permissions.

| HTTP Method | Operation |
|---|---|
| GET | Retrieve task lists or individual tasks |
| POST | Create a task |
| PUT | Replace an existing task |
| PATCH | Partially update a task |
| DELETE | Delete a task |

The exact task endpoint paths depend on the routes configured in Django REST Framework.

### Task Fields

| Field | Description |
|---|---|
| Title | Short name of the task |
| Description | Additional task details |
| Due Date | Date by which the task should be completed |
| Priority | Task priority level |
| Status | Indicates whether the task is pending or completed |
| User | Owner of the task |



## Django Administration

If configured, the Django admin panel is available at:

http://127.0.0.1:8000/admin/

Log in using the superuser credentials created during setup.


