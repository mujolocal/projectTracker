# Project Tracker Application

A local project tracking system built with FastAPI backend and vanilla JavaScript frontend. Track your projects with features, updates, and completion status.

## Features

- ✅ Create, edit, and delete projects
- ✅ Track project name, start date, and completion status
- ✅ Manage features with start/end dates and status tracking
- ✅ Add timestamped updates/notes to projects
- ✅ Responsive web interface
- ✅ Local SQLite database (no external dependencies)
- ✅ RESTful API with full CRUD operations

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Create Project Structure

Create the following directory structure:
```
project-tracker/
├── main.py              # FastAPI backend
├── requirements.txt     # Python dependencies
├── projects.db          # SQLite database (auto-created)
└── static/
    └── index.html       # Frontend application
```

### 3. Setup Files

1. Save the FastAPI backend code as `main.py`
2. Save the frontend HTML code as `static/index.html`
3. Create the `requirements.txt` file with the dependencies

### 4. Run the Application

```bash
python main.py
```

The application will start on `http://localhost:8000`

- **API Documentation**: `http://localhost:8000/docs`
- **Web Interface**: `http://localhost:8000`

## Usage

### Web Interface

1. **Create Project**: Click "New Project" to add a new project
2. **Add Features**: Within the project modal, add features with optional start/end dates
3. **Add Updates**: Add timestamped notes to track project progress
4. **Edit Projects**: Click "Edit" on any project card to modify details
5. **Delete Projects**: Click "Delete" to remove projects (with confirmation)

### API Endpoints

#### Projects
- `GET /projects` - List all projects
- `GET /projects/{id}` - Get specific project
- `POST /projects` - Create new project
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

#### Features
- `POST /projects/{id}/features` - Add feature to project
- `PUT /projects/{project_id}/features/{feature_id}` - Update feature
- `DELETE /projects/{project_id}/features/{feature_id}` - Delete feature

#### Updates
- `POST /projects/{id}/updates` - Add update to project
- `DELETE /projects/{project_id}/updates/{update_id}` - Delete update

## Database Schema

### Projects Table
- `id` (Primary Key)
- `name` (Text)
- `date_started` (Text/Date)
- `completion_status` (Text: not_started, in_progress, completed)
- `created_at`, `updated_at` (Timestamps)

### Features Table
- `id` (Primary Key)
- `project_id` (Foreign Key)
- `name` (Text)
- `start_date`, `end_date` (Text/Date, Optional)
- `status` (Text: not_started, in_progress, completed)

### Updates Table
- `id` (Primary Key)
- `project_id` (Foreign Key)
- `note` (Text)
- `date` (Text/Date)
- `created_at` (Timestamp)

## Development

### Running in Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Testing

Visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI.

### Frontend Development

The frontend is a single HTML file with vanilla JavaScript. No build process required - just edit and refresh!

## Troubleshooting

### Common Issues

1. **Port 8000 already in use**: Change the port in `main.py` or kill the process using port 8000
2. **CORS errors**: Make sure the API is running on `localhost:8000` or update the `API_BASE` constant in the HTML file
3. **Database issues**: Delete `projects.db` to reset the database (will lose all data)

### Backend Issues

- Check that FastAPI is properly installed: `pip list | grep fastapi`
- Ensure SQLite is working: `python -c "import sqlite3; print('SQLite OK')"`
- Check server logs for detailed error messages

### Frontend Issues

- Open browser developer tools (F12) to check for JavaScript errors
- Verify the API is accessible by visiting `http://localhost:8000/projects` directly
- Check network tab for failed API requests

## Data Backup

The SQLite database file (`projects.db`) contains all your data. Back it up regularly by copying the file to a safe location.

## License

This project is open source and available under the MIT License.