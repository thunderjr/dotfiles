#!/bin/bash
# Simple click handler that sets SENDER and calls the main script
export SENDER="mouse.clicked"
export NAME="caffeine"
exec "$HOME/.config/sketchybar/plugins/caffeine.sh"
