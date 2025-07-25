# Using Node 23
FROM node:23

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-venv \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set python env
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

#Install youtube-dl
RUN pip install --no-cache-dir youtube-dl

# Create workdir
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy other files
COPY . .

# Build project
RUN npm run build:core

# Open port
EXPOSE 3010

# Run app
RUN chown -R node:node /app
USER node
CMD ["npm", "run", "boot"] # dev boot, fix later

## not full dockerfile ...