#!/bin/bash
set -euo pipefail

# Execute entrypoint script to setup environment, then start supervisor
/entrypoint.sh /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
