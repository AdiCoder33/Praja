"""
FIR Assistant Backend Application
"""

from flask import Flask
from flask_cors import CORS

def create_app():
    """Application factory pattern"""
    app = Flask(__name__, static_folder='../../frontend/public')
    CORS(app)

    # Register routes
    from app.routes import chat, health
    app.register_blueprint(chat.bp)
    app.register_blueprint(health.bp)

    return app
