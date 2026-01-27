#!/bin/bash

PREV_FILE="/tmp/sketchybar_network_prev"

# Get active network interface
IFACE=$(route get default 2>/dev/null | awk '/interface:/ {print $2}')

if [ -z "$IFACE" ]; then
  sketchybar --set "$NAME" label="offline"
  exit 0
fi

# Read current byte counters from netstat (Link# row)
# Columns: Name Mtu Network Address Ipkts Ierrs Ibytes Opkts Oerrs Obytes Coll
read -r DOWN_BYTES UP_BYTES <<< "$(netstat -ib -I "$IFACE" | awk '/Link#/ {print $7, $10; exit}')"

NOW=$(date +%s)

if [ -z "$DOWN_BYTES" ] || [ -z "$UP_BYTES" ]; then
  sketchybar --set "$NAME" label="--"
  exit 0
fi

# Read previous values
if [ -f "$PREV_FILE" ]; then
  read -r PREV_IFACE PREV_DOWN PREV_UP PREV_TIME < "$PREV_FILE"
fi

# Save current values
echo "$IFACE $DOWN_BYTES $UP_BYTES $NOW" > "$PREV_FILE"

# First run or interface changed — no delta yet
if [ -z "$PREV_TIME" ] || [ "$PREV_IFACE" != "$IFACE" ]; then
  sketchybar --set "$NAME" label="↓0B/s ↑0B/s"
  exit 0
fi

ELAPSED=$((NOW - PREV_TIME))
if [ "$ELAPSED" -le 0 ]; then
  ELAPSED=1
fi

DOWN_DELTA=$(( (DOWN_BYTES - PREV_DOWN) / ELAPSED ))
UP_DELTA=$(( (UP_BYTES - PREV_UP) / ELAPSED ))

# Clamp negatives (counter reset)
[ "$DOWN_DELTA" -lt 0 ] && DOWN_DELTA=0
[ "$UP_DELTA" -lt 0 ] && UP_DELTA=0

format_speed() {
  local bytes=$1
  if [ "$bytes" -ge 1048576 ]; then
    printf "%.1fMB/s" "$(echo "scale=1; $bytes/1048576" | bc)"
  elif [ "$bytes" -ge 1024 ]; then
    printf "%.0fKB/s" "$(echo "scale=0; $bytes/1024" | bc)"
  else
    printf "%dB/s" "$bytes"
  fi
}

DOWN_FMT=$(format_speed "$DOWN_DELTA")
UP_FMT=$(format_speed "$UP_DELTA")

sketchybar --set "$NAME" label="↓${DOWN_FMT} ↑${UP_FMT}"
