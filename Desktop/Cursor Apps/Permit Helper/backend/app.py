from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS # type: ignore
import os
from dotenv import load_dotenv

# Import API routes
from api.routes import api_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api')

# Root route
@app.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "PermitHelper API is running"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 