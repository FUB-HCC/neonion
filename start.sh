#!/bin/bash

echo "Running the init-scripts"
python manage.py migrate --noinput

# start Gunicorn processes
echo "Starting Gunicorn."
exec gunicorn wsgi_docker:application \
	    --bind 0.0.0.0:8000 \
		    --workers 3
