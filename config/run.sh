#!/bin/bash
set -e

# Execute entrypoint script
/entrypoint.sh

# Start supervisor
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
set -euo pipefail

# Ensure config directory exists
mkdir -p /config

# Launch supervisor which manages all services
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
