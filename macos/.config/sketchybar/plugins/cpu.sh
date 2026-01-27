#!/bin/bash

CPU_LINE=$(top -l 2 -n 0 -s 2 2>/dev/null | grep "CPU usage:" | tail -1)

USER=$(echo "$CPU_LINE" | awk '{print $3}' | tr -d '%')
SYS=$(echo "$CPU_LINE" | awk '{print $5}' | tr -d '%')

if [ -z "$USER" ] || [ -z "$SYS" ]; then
  sketchybar --set "$NAME" label="--"
  exit 0
fi

TOTAL=$(echo "$USER + $SYS" | bc | awk '{printf "%.0f", $1}')

sketchybar --set "$NAME" label="${TOTAL}%"
