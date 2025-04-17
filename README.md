CLONE The REPO
git clone https://github.com/Harshkhatri02/JobBoard.git


Install all the required packages automatically for the project
npm install 

📁 Environment Variables (.env)
This project uses environment variables for secure configuration. Create a .env file in the root of the project and add the following keys:

SESSION_SECRET_KEY=your_secret_session_key


🔧 Steps to Get Google OAuth Credentials for Passport.js
✅ 1. Go to Google Cloud Console
Link: https://console.cloud.google.com/

Sign in with your Google account.

✅ 2. Create a New Project
Click the project dropdown (top left) → New Project.

Give it a name like JobBoard OAuth App and click Create.

Select the project once created.

✅ 3. Enable the Google+ API or People API
(People API is recommended as Google+ is deprecated)

In the left menu, go to "APIs & Services" → "Library".

Search for People API and click Enable.

✅ 4. Configure OAuth Consent Screen
Go to "APIs & Services" → "OAuth consent screen".

Select External (for public users) → Click Create.

Fill in:

App name

User support email

Developer contact info

Click Save and Continue (you can skip scopes and test users for now if not publishing).

✅ 5. Create OAuth Client ID
Go to "APIs & Services" → "Credentials".

Click Create Credentials → Select OAuth Client ID.

Choose Web application.

Name it something like Web OAuth for JobBoard.

✅ 6. Add Authorized Redirect URI
Under "Authorized redirect URIs", add the following:

http://localhost:3000/auth/google/callback
(Update this later for production deployment)

Click Create.

✅ 7. Copy Client ID and Secret
Once created, copy:

Client ID

Client Secret


✅ 8. Add to .env File
Inside your project folder, create or update .env like this:
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
-----> DEMO URL:
CLIENT_URL="http://localhost:8000/auth/google/callback"

DB_CONNECT=your_mongodb_connection_string

🔒 Notes for You'all:
Never share your .env file or push it to GitHub. It should be listed in .gitignore.

These values are accessed in code using process.env.KEY_NAME via the dotenv package.

🛠 Setup:
Make sure to install dotenv if not already:

npm install dotenv

And require it at the top of your app.js:
require("dotenv").config();


And finally, Run App:
node app
