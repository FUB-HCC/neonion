#!/bin/bash

# start Gunicorn processes
echo "Starting Gunicorn."
exec gunicorn wsgi_dev:application \
	    --bind 0.0.0.0:8000 \
		    --workers 3
