from app import create_app
import os

if __name__ == '__main__':
    # Set environment variables for development
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = '1'

    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
