#!/bin/bash

# Get page size from vm_stat header
PAGE_SIZE=$(vm_stat | head -1 | grep -o '[0-9]*')

# Get page counts
read -r ACTIVE INACTIVE SPECULATIVE WIRED COMPRESSED PURGEABLE EXTERNAL <<< "$(vm_stat | awk '
  /Pages active:/                 {a=$3}
  /Pages inactive:/               {i=$3}
  /Pages speculative:/            {s=$3}
  /Pages wired down:/             {w=$4}
  /Pages occupied by compressor:/ {c=$5}
  /Pages purgeable:/              {p=$3}
  /File-backed pages:/            {e=$3}
  END {
    gsub(/\./,"",a); gsub(/\./,"",i); gsub(/\./,"",s)
    gsub(/\./,"",w); gsub(/\./,"",c); gsub(/\./,"",p); gsub(/\./,"",e)
    print a, i, s, w, c, p, e
  }
')"

TOTAL_MEM=$(sysctl -n hw.memsize)

if [ -z "$ACTIVE" ] || [ -z "$WIRED" ] || [ -z "$TOTAL_MEM" ]; then
  sketchybar --set "$NAME" label="--"
  exit 0
fi

INACTIVE=${INACTIVE:-0}
SPECULATIVE=${SPECULATIVE:-0}
COMPRESSED=${COMPRESSED:-0}
PURGEABLE=${PURGEABLE:-0}
EXTERNAL=${EXTERNAL:-0}
USED_BYTES=$(( (ACTIVE + INACTIVE + SPECULATIVE + WIRED + COMPRESSED - PURGEABLE - EXTERNAL) * PAGE_SIZE ))
PERCENT=$(echo "scale=0; $USED_BYTES * 100 / $TOTAL_MEM" | bc)

sketchybar --set "$NAME" label="${PERCENT}%"
