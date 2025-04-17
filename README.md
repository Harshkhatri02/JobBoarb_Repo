# JobBoard

A comprehensive job board platform with user authentication via Google OAuth.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Harshkhatri02/JobBoard.git

# Navigate to project directory
cd JobBoard

# Install dependencies
npm install

# Start the application
node app
```

## 🔐 Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
SESSION_SECRET_KEY=your_secret_session_key
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
CLIENT_URL=http://localhost:8000/auth/google/callback
DB_CONNECT=your_mongodb_connection_string
```

## 🔑 Google OAuth Setup Guide

### 1. Access Google Cloud Console
- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Sign in with your Google account

### 2. Create New Project
- Click the project dropdown (top left) → New Project
- Name it (e.g., "JobBoard OAuth App") and click Create
- Select the newly created project

### 3. Enable Required API
- Navigate to "APIs & Services" → "Library"
- Search for "People API" and enable it

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Select "External" (for public users) → Click Create
- Fill in required fields:
  - App name
  - User support email
  - Developer contact information
- Click Save and Continue

### 5. Create OAuth Client ID
- Go to "APIs & Services" → "Credentials"
- Click Create Credentials → OAuth Client ID
- Select "Web application"
- Provide a suitable name

### 6. Add Redirect URI
- Under "Authorized redirect URIs", add:
  ```
  http://localhost:8000/auth/google/callback
  ```
- Click Create

### 7. Copy Credentials
- After creation, copy the Client ID and Client Secret
- Add these to your `.env` file

## 📋 Project Structure

```
JobBoard/
├── app.js          # Main application entry point
├── routes/         # API and page routes
├── models/         # Database models
├── public/         # Static assets
├── views/          # Frontend templates
├── middleware/     # Custom middleware functions
├── .env            # Environment variables (create this)
└── package.json    # Project dependencies
```

## 🔧 Technologies Used

- Node.js
- Express.js
- MongoDB
- Passport.js (Google OAuth)
- EJS/Handlebars (or your template engine)

## 🛡️ Security Notes

- Never commit your `.env` file to version control
- Ensure `.env` is included in `.gitignore`
- Rotate secrets regularly for production deployments

## 🌐 Deployment

For production deployment:
1. Update the CLIENT_URL in your .env file
2. Add the production callback URL to Google OAuth authorized URIs
3. Configure your production database connection
