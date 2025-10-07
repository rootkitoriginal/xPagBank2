#!/bin/bash
set -e

# Create required directories
mkdir -p /var/log/supervisor
mkdir -p /var/run

# Setup VNC environment
mkdir -p /tmp/.X11-unix
chmod 1777 /tmp/.X11-unix

# Start supervisord
exec "$@"
set -euo pipefail

echo "[EntryPoint] Starting PagBank application"
exec node app.js
