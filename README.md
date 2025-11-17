# 🌟 Made It Out

**A full-stack trip planning application with AI-powered features and real-time collaboration**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)


---

## 📖 Overview

Made It Out is a comprehensive trip planning platform that brings your travel dreams to life! Whether you're planning a weekend getaway with friends, a family vacation, or a business trip, our application provides everything you need to organize, collaborate, and communicate seamlessly.

### ✨ Key Highlights
- **🤖 AI-Powered Descriptions** - Generate intelligent trip descriptions using Google Gemini API
- **💬 Real-Time Chat** - Stay connected with your travel companions
- **📱 Progressive Web App** - Install and use offline on any device
- **🗓️ Interactive Itineraries** - Drag-and-swipe day navigation
- **👥 Collaborative Planning** - Invite friends and family to join your trips

---

## Project Screenshots


## 🚀 Features

### 🔐 User Authentication
- Secure sign-up and sign-in system
- JWT-based authentication
- Password hashing with bcrypt

### 🧳 Trip Management
- **Create Trips** - Add titles, destinations, and dates
- **AI Descriptions** - Generate trip descriptions with Google Gemini API
- **Trip Dashboard** - View active, upcoming, and past trips
- **Smart Organization** - Categorized trip views

### 📅 Itinerary Planning
- **Detailed Views** - Comprehensive itinerary for each trip
- **Event Management** - Add, view, and delete daily events
- **Interactive Navigation** - Swipe-friendly day carousel
- **Day-by-Day Planning** - Organize activities by specific dates

### 💬 Real-Time Communication
- **Firebase Chat** - Cloud-powered messaging for each trip
- **Real-Time Sync** - Instant message delivery across all devices
- **Message Persistence** - Reliable message storage and history
- **Multi-User Support** - Seamless chat with all trip members
- **Offline Support** - Messages sync when back online

### 👥 Social Features
- **User Invitations** - Invite via username or email
- **Profile Management** - Manage your account and invitations
- **Collaborative Planning** - Work together on trip details


---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** | User interface framework |
| **React Router DOM** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **date-fns** | Date manipulation |
| **Firebase SDK** | Real-time chat and messaging |
| **@headlessui/react** | Accessible UI components |

### Backend
| Technology | Purpose |
|------------|---------|
| **Flask** | Python web framework |
| **PyMongo** | MongoDB integration |
| **Flask-JWT-Extended** | JWT authentication |
| **Flask-Bcrypt** | Password security |
| **Flask-CORS** | Cross-origin requests |
| **python-dotenv** | Environment management |

### Database & APIs
- **MongoDB** - NoSQL document database
- **Firebase** - Real-time chat and messaging
- **Google Gemini API** - AI-powered content generation

---

## ⚙️ Setup Instructions

### 📋 Prerequisites
- **Node.js** (LTS version) and npm/yarn
- **Python 3.9+**
- **MongoDB Atlas** account or local MongoDB instance
- **Firebase** project with Firestore enabled

### 🔧 Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-name>/Backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. **Install dependencies**
   
   Create `requirements.txt`:
   ```txt
   Flask==3.1.1
   Flask-CORS==4.0.0
   python-dotenv==1.0.1
   pymongo==4.7.2
   Flask-Bcrypt==1.0.1
   Flask-JWT-Extended==4.7.1
   Flask-Session==0.8.0
   ```
   
   Then install:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   
   Create `.env` file:
   ```env
   MONGO_URI="your_mongodb_connection_string"
   SECRET_KEY="a_very_secret_key_for_flask_session"
   JWT_SECRET_KEY="another_very_secret_key_for_jwt"
   ```

5. **Start the backend**
   ```bash
   python run.py
   ```
   Backend runs on `http://127.0.0.1:5000`

### 🎨 Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # OR
   yarn install
   ```

3. **Firebase setup**
   
   Create a Firebase project and enable Firestore:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Firestore Database
   - Get your Firebase config object
   
   Create `src/firebase/config.js`:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   
   const firebaseConfig = {
     // Your Firebase config object
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   
   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   ```

4. **Create PWA icons**
   
   In `public/icons/` directory, add these icon sizes:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

4. **Start the frontend**
   ```bash
   npm start
   # OR
   yarn start
   ```
   Frontend runs on `http://localhost:3000`

> **Note**: Make sure to add your domain to Firebase's authorized domains in the Firebase Console under Authentication > Settings > Authorized domains.

---

## 🎯 How to Use

### Getting Started
1. **🔐 Sign Up/Sign In** - Create your account or log in
2. **📊 Dashboard** - View and manage all your trips
3. **➕ Create Trip** - Plan new adventures with AI assistance

### Planning Your Trip
4. **📝 Add Details** - Set destinations, dates, and descriptions
5. **🤖 AI Generation** - Use "Generate Description with AI" for smart suggestions
6. **📅 Build Itinerary** - Add events and activities for each day

### Collaboration
7. **👥 Invite Friends** - Add travel companions via username/email
8. **💬 Firebase Chat** - Real-time messaging powered by Firestore
9. **🤝 Manage Invites** - Accept/decline trip invitations in your profile

### Mobile Experience
10. **📱 Install PWA** - Add to home screen for app-like experience
11. **✈️ Navigate** - Swipe through days and manage your itinerary on-the-go

---

## 📱 PWA Installation

### 🖥️ Desktop
- **Chrome/Edge**: Click the install icon in the address bar
- **Firefox**: Look for "Install" option in the address bar

### 📱 Mobile
- **Android (Chrome)**: Menu → "Add to Home screen"
- **iOS (Safari)**: Share button → "Add to Home Screen"

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **💻 Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **📤 Push** to the branch (`git push origin feature/AmazingFeature`)
5. **🔄 Open** a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Google Gemini API for AI-powered features
- Firebase for real-time chat infrastructure
- The amazing open-source community

---

<div align="center">

**Made with ❤️ for travelers everywhere**

[⭐ Star this repo](../../stargazers) | [🐛 Report Bug](../../issues) | [💡 Request Feature](../../issues)

</div>
