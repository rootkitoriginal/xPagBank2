FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    fluxbox \
    supervisor \
    python3 \
    python3-pip \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install noVNC
RUN mkdir -p /usr/local/novnc && \
    mkdir -p /usr/local/novnc/utils/websockify && \
    wget -qO- https://github.com/novnc/noVNC/archive/v1.4.0.tar.gz | tar xz --strip 1 -C /usr/local/novnc && \
    wget -qO- https://github.com/novnc/websockify/archive/v0.11.0.tar.gz | tar xz --strip 1 -C /usr/local/novnc/utils/websockify && \
    cp /usr/local/novnc/vnc.html /usr/local/novnc/index.html

# Set up work directory for the Node.js application
WORKDIR /app
COPY container/package*.json ./
RUN npm install

# Copy the Node.js application
COPY container .

# Set up environment variables
ENV DISPLAY=:0 \
    RESOLUTION=1280x720x24 \
    VNC_PORT=5900 \
    NOVNC_PORT=6080 \
    APP_PORT=3000

# Copy configuration files
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY entrypoint.sh /entrypoint.sh
COPY config/run.sh /config/run.sh

# Make scripts executable
RUN chmod +x /entrypoint.sh /config/run.sh

# Expose ports
EXPOSE $APP_PORT $NOVNC_PORT $VNC_PORT

# Set entrypoint
ENTRYPOINT ["/config/run.sh"]

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

# Set permissions
RUN chmod +x entrypoint.sh

# Set environment variables
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8000

EXPOSE 8000

CMD ["./entrypoint.sh"]