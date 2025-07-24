Made It Out ApplicationWelcome to the Made It Out application! This is a full-stack web application designed to help you plan trips with friends, family, or colleagues, manage itineraries, and communicate in real-time through integrated chat features. It also leverages the Google Gemini API for intelligent trip description generation and is built as a Progressive Web App (PWA) for an enhanced mobile experience.FeaturesUser Authentication: Secure sign-up and sign-in.Trip Management:Create new trips with titles, destinations, and dates.Generate AI-powered trip descriptions using the Google Gemini API.View active, upcoming, and past trips on a personalized dashboard.Itinerary Planning:Detailed itinerary view for each trip.Add, view, and delete events for specific days.Interactive day carousel with grab-and-swipe functionality for easy navigation.Real-time Chat:Integrated chat feature for each trip, allowing real-time communication among trip members.Historical message loading.User Invites: Invite other users to join your trips via username or email.Profile Management: View your profile and manage pending trip invitations.Progressive Web App (PWA):Installable on desktop and mobile devices for an app-like experience.Offline capabilities (basic caching).Technologies UsedFrontend:React.js: A JavaScript library for building user interfaces.React Router DOM: For client-side routing.Tailwind CSS: A utility-first CSS framework for rapid UI development.date-fns: A modern JavaScript date utility library.Socket.IO Client: For real-time, bidirectional communication.@headlessui/react: Unstyled, accessible UI components.Google Gemini API: For AI-powered trip description generation.Backend:Flask: A Python web framework.Flask-SocketIO: Integrates Socket.IO with Flask for WebSocket communication.PyMongo: Python driver for MongoDB.Flask-JWT-Extended: For handling JSON Web Tokens (JWT) for authentication.Flask-Bcrypt: For password hashing.Flask-CORS: For handling Cross-Origin Resource Sharing.python-dotenv: For managing environment variables.eventlet: A concurrency library for asynchronous operations, used by Flask-SocketIO.MongoDB: A NoSQL database for storing application data.Setup InstructionsFollow these steps to get the application up and running on your local machine.PrerequisitesNode.js (LTS version recommended) and npm/yarnPython 3.9+MongoDB Atlas account (or local MongoDB instance)1. Backend SetupClone the repository:git clone <your-repo-url>
cd <your-repo-directory>/Backend

Create and activate a Python virtual environment:python3 -m venv venv
source venv/bin/activate # On Windows: .\venv\Scripts\activate

Install backend dependencies:Create a requirements.txt file in your Backend directory with the following content:Flask==3.1.1
Flask-CORS==4.0.0
python-dotenv==1.0.1
pymongo==4.7.2
Flask-Bcrypt==1.0.1
Flask-JWT-Extended==4.7.1
Flask-Session==0.8.0
Flask-SocketIO==5.5.1
python-socketio==5.13.0
python-engineio==4.12.2
eventlet==0.40.2
dnspython==2.7.0
greenlet==3.2.3
bidict==0.23.1
simple-websocket==1.1.0
wsproto==1.2.0
h11==0.16.0

Then install:pip install -r requirements.txt

Create a .env file:In the Backend directory, create a file named .env and add your MongoDB URI and JWT secret key:MONGO_URI="your_mongodb_connection_string"
SECRET_KEY="a_very_secret_key_for_flask_session"
JWT_SECRET_KEY="another_very_secret_key_for_jwt"

Replace "your_mongodb_connection_string" with your actual MongoDB Atlas connection string (or local connection string).Run the Flask backend:python run.py

The backend server should start on http://127.0.0.1:5000. You should see (eventlet) wsgi starting up on http://127.0.0.1:5000 in your terminal.2. Frontend SetupNavigate to the frontend directory:cd ../Frontend # Assuming your frontend is in a 'Frontend' directory parallel to 'Backend'

Install frontend dependencies:npm install

# OR

yarn install

Create PWA Icons:In the public directory, create a folder named icons. You must place your application icons in this folder with the following names and sizes:icon-72x72.pngicon-96x96.pngicon-128x128.pngicon-144x144.pngicon-152x152.pngicon-192x192.pngicon-384x384.pngicon-512x512.png(You can use online PWA icon generators to create these from a single high-resolution image).Run the React frontend:npm start

# OR

yarn start

The frontend application should open in your browser, typically on http://localhost:3000 or http://localhost:5173.UsageSign Up / Sign In: Register a new account or log in with existing credentials.Dashboard: View your current, upcoming, and past trips. You can refresh the list of trips.Create Trip: Plan a new trip by providing details. Use the "Generate Description with AI" button to get an AI-powered description.Itinerary: Navigate to a trip's itinerary to view and manage events for each day. Use the left/right arrows or swipe/drag the day card to move between days.Invite Users: Invite other registered users to your trips.Profile: View your user details and accept pending trip invitations.PWA InstallationOnce the frontend is running:Desktop: In Chrome (or other Chromium-based browsers), you should see an "install" icon in the address bar. Click it to install the app.Android: Open the app in Chrome, then select "Add to Home screen" from the browser's menu.iOS: Open the app in Safari, then tap the Share button and select "Add to Home Screen."ContributingFeel free to fork the repository, make improvements, and submit pull requests.License[Specify your license here, e.g., MIT, Apache 2.0, etc.]
