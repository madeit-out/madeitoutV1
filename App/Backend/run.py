from app import create_app # Assuming 'app' is your package containing create_app

    # Call create_app to get both the Flask app and the SocketIO instance
app, socketio_instance = create_app()

    # Run the SocketIO server.
    # This is the correct way to start your Flask app when using Flask-SocketIO.
    # Ensure the port matches the SOCKET_SERVER_URL in your frontend (e.g., Itinerary.jsx)
if __name__ == '__main__':
        socketio_instance.run(app, debug=False, port=5000) # Keep debug=False for now
    
