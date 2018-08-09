# FROM directive instructing base image to build upon
FROM python:2-onbuild

# map folder inside docker to outside (VM)
VOLUME /data

# COPY startup script into known file location in container
COPY start.sh /start.sh

# EXPOSE port 8000 to allow communication to/from server
EXPOSE 8000

# CMD specifies the command to execute to start the server running.
CMD ["/start.sh"]
