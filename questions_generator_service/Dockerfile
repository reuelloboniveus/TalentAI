# Use official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.11-slim

# Allow statements and log messages to immediately appear in Cloud Run logs
ENV PYTHONUNBUFFERED True

# Set working directory inside the container
WORKDIR /app

# Copy dependency requirements first for better Docker caching
COPY requirements.txt .

# Install production dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application files to the container
COPY . .

# Expose default port
EXPOSE 8080

# Start the web service on container startup.
# We bind to 0.0.0.0 and listen on the PORT environment variable provided by Cloud Run.
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
