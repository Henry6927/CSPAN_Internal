from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__, static_folder='../build')
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://10.10.8.178:5000"]}})
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from . import models  # Import models after db initialization
        from .routes import term_routes, audit_routes, regenerate_routes
        app.register_blueprint(term_routes.bp, url_prefix='/api/terms')
        app.register_blueprint(audit_routes.bp, url_prefix='/api/audit')
        app.register_blueprint(regenerate_routes.bp, url_prefix='/api')
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
