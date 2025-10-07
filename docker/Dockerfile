FROM node:18-slim

# Install system dependencies including Playwright requirements
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    fluxbox \
    supervisor \
    python3 \
    python3-pip \
    wget \
    unzip \
    procps \
    # Playwright/Chromium dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    libxshmfence1 \
    fonts-liberation \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Install noVNC
RUN mkdir -p /usr/local/novnc && \
    mkdir -p /usr/local/novnc/utils/websockify && \
    wget -qO- https://github.com/novnc/noVNC/archive/v1.4.0.tar.gz | tar xz --strip 1 -C /usr/local/novnc && \
    wget -qO- https://github.com/novnc/websockify/archive/v0.11.0.tar.gz | tar xz --strip 1 -C /usr/local/novnc/utils/websockify && \
    cp /usr/local/novnc/vnc.html /usr/local/novnc/index.html

# Set up work directory for the Node.js application
WORKDIR /app

# Copy container application package files
COPY container/package*.json ./
RUN npm install

# Install Playwright with Chromium
RUN npm install -D @playwright/test playwright
RUN npx playwright install chromium --with-deps

# Copy the Node.js application
COPY container .

# Set up environment variables
ENV DISPLAY=:0 \
    RESOLUTION=1280x720x24 \
    VNC_PORT=5900 \
    NOVNC_PORT=6080 \
    APP_PORT=3000 \
    NODE_ENV=production

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