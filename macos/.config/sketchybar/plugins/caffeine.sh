#!/bin/bash

CAFFEINE_STATE_FILE="$HOME/.config/sketchybar/.caffeine_state"
ICON_ACTIVE="󰶟"
ICON_INACTIVE="󰛊"

is_active() {
    [ -f "$CAFFEINE_STATE_FILE" ] && [ "$(cat "$CAFFEINE_STATE_FILE")" = "on" ]
}

if [ "$SENDER" = "mouse.clicked" ]; then
    if is_active; then
        # Disable caffeine (re-enable sleep)
        sudo -n /usr/bin/pmset -c disablesleep 0
        echo "off" > "$CAFFEINE_STATE_FILE"
    else
        # Enable caffeine (prevent sleep)
        sudo -n /usr/bin/pmset -c disablesleep 1
        echo "on" > "$CAFFEINE_STATE_FILE"
    fi
fi

if is_active; then
    sketchybar --set "$NAME" icon="$ICON_ACTIVE" icon.color=0xffffcc00
else
    sketchybar --set "$NAME" icon="$ICON_INACTIVE" icon.color=0xffffffff
fi
