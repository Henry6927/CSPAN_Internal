import logging
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import DevelopmentConfig
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    # Set up logging
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(__name__)
    
    app = Flask(__name__, static_folder='../build')
    
    # Use environment variables for CORS origins
    frontend_url = os.getenv('REACT_APP_FRONTEND_URL', '')
    backend_url = os.getenv('REACT_APP_BACKEND_URL', '')
    
    CORS(app, resources={r"/*": {"origins": [frontend_url, backend_url]}})
    app.config.from_object(DevelopmentConfig)

    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from . import models  # Import models after db initialization
        from .routes import term_routes, audit_routes, regenerate_routes, legislation_routes
        app.register_blueprint(term_routes.bp, url_prefix='/api/terms')
        app.register_blueprint(audit_routes.bp, url_prefix='/api/audit')
        app.register_blueprint(regenerate_routes.bp, url_prefix='/api')
        app.register_blueprint(legislation_routes.bp, url_prefix='/api/legislation')
        
        logger.debug("Database tables creation if not existing.")
        db.create_all()

    @app.route('/')
    def serve_index():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:path>')
    def serve_static_files(path):
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
