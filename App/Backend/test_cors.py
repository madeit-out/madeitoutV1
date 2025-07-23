from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    return 'Login endpoint'

if __name__ == "__main__":
    app.run(debug=True)
