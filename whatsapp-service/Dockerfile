# Dockerfile for WhatsApp WebJS Service - Production
# Optimized for size and security with multi-stage build

FROM node:20-slim AS base

# Install Chrome dependencies and curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    curl \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Builder stage for dependencies
FROM base AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci && npm cache clean --force

# Production stage
FROM base AS production

# Create non-root user
RUN groupadd -r whatsapp -g 1001 && \
    useradd -r -g whatsapp -u 1001 -d /home/whatsapp -m whatsapp

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --chown=whatsapp:whatsapp src/ ./src/
COPY --chown=whatsapp:whatsapp public/ ./public/

# Create necessary directories with proper permissions
RUN mkdir -p logs sessions .wwebjs_auth .wwebjs_cache \
    && chown -R whatsapp:whatsapp logs sessions .wwebjs_auth .wwebjs_cache \
    && chmod -R 755 logs sessions .wwebjs_auth .wwebjs_cache

# Fix Chrome permissions for non-root user
RUN chown -R whatsapp:whatsapp /usr/bin/google-chrome \
    && chmod 755 /usr/bin/google-chrome \
    && mkdir -p /tmp/.cache /tmp/.puppeteer \
    && chown -R whatsapp:whatsapp /tmp/.cache /tmp/.puppeteer

# Switch to non-root user
USER whatsapp
ENV HOME=/home/whatsapp
ENV PUPPETEER_CACHE_DIR=/tmp/.puppeteer

# Expose port
EXPOSE 3002

# Set production environment
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
ENV PUPPETEER_HEADLESS=true
ENV SESSION_SAVE_PATH=/app/sessions
ENV LOG_PATH=/app/logs
ENV PORT=3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

# Start application
CMD ["npm", "start"]
