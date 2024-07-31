import os

class Config:
    """Base configuration with default settings."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_default_secret_key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_HEADERS = 'Content-Type'
    STATIC_FOLDER = 'static'
    TEMPLATES_FOLDER = 'templates'
    # Add other common configurations here


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DEV_DATABASE_URL', 'sqlite:///development.db')
    FRONTEND_URL = os.getenv('REACT_APP_FRONTEND_URL', 'http://localhost:3000')
    BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:5000')


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URL', 'sqlite:///testing.db')
    FRONTEND_URL = os.getenv('REACT_APP_FRONTEND_URL', 'http://localhost:3000')
    BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:5000')


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://user@localhost/prod_db')
    FRONTEND_URL = os.getenv('REACT_APP_FRONTEND_URL', 'https://your-production-frontend.com')
    BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://your-production-backend.com')


# Add additional configuration classes as needed
