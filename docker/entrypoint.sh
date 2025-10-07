#!/bin/bash
set -e

# Create required directories
mkdir -p /var/log/supervisor
mkdir -p /var/run

# Setup VNC environment
mkdir -p /tmp/.X11-unix
chmod 1777 /tmp/.X11-unix

echo "[EntryPoint] Starting PagBank application with noVNC support"

# Execute the command passed as argument
exec "$@"
