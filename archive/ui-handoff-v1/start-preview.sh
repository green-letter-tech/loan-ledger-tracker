#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PREFERRED_PORT="${1:-8765}"
PREVIEW_PATH="/LendLedger.html"

port_in_use() {
  lsof -i ":$1" -sTCP:LISTEN >/dev/null 2>&1
}

preview_ready() {
  curl -sf -o /dev/null "http://localhost:$1${PREVIEW_PATH}" 2>/dev/null
}

echo ""
echo "  LendLedger design preview"

if port_in_use "$PREFERRED_PORT" && preview_ready "$PREFERRED_PORT"; then
  echo "  Already running — no need to start again."
  echo "  Open in Brave:  http://localhost:${PREFERRED_PORT}${PREVIEW_PATH}"
  echo ""
  exit 0
fi

PORT="$PREFERRED_PORT"
if port_in_use "$PORT"; then
  echo "  Port ${PORT} is in use by another app."
  for try in 8766 8767 8768 8769 8770; do
    if ! port_in_use "$try"; then
      PORT="$try"
      break
    fi
  done
  if port_in_use "$PORT"; then
    echo "  Could not find a free port. Stop the other process or run:"
    echo "    ./start-preview.sh 9000"
    exit 1
  fi
  echo "  Using port ${PORT} instead."
fi

echo "  Open in Brave:  http://localhost:${PORT}${PREVIEW_PATH}"
echo "  Press Ctrl+C to stop."
echo ""
exec python3 -m http.server "$PORT"
